import * as fs from 'node:fs';
import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import * as swc from '@swc/core';
import esbuild from 'esbuild';
import { fromAsyncThrowable, ok, Result, ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { AppContainer } from '../app/app.container.js';

import type { NodeEnv } from '../schemas/env.schema.js';
import type { UserConfigOptions } from '../user-config.js';

const $UserConfigOptions: z.ZodType<UserConfigOptions> = z.object({
  entry: z.function().returns(z.promise(z.record(z.unknown()))),
  globals: z.record(z.unknown()).optional()
});

function resolveAbsoluteImportPathFromCwd(filename: string): Result<string, typeof RuntimeException.Instance> {
  const filepath = path.resolve(process.cwd(), filename);
  const extension = path.extname(filepath);
  if (!fs.existsSync(filepath)) {
    return RuntimeException.asErr(`File does not exist: ${filepath}`);
  } else if (!fs.lstatSync(filepath).isFile()) {
    return RuntimeException.asErr(`Not a file: ${filepath}`);
  } else if (!(extension === '.js' || extension === '.ts')) {
    return RuntimeException.asErr(`Unexpected file extension '${extension}': must be '.js' or '.ts'`);
  }
  return ok(filepath);
}

function findConfig(baseDir: string): Result<string, typeof RuntimeException.Instance> {
  const searched: string[] = [];

  let searchDir = baseDir;
  do {
    const entries = fs.readdirSync(searchDir);
    for (const entry of entries) {
      if (/libnest\.config\.(t|j)s/.exec(entry)) {
        return ok(path.resolve(searchDir, entry));
      }
    }
    searched.push(searchDir);
    searchDir = path.dirname(searchDir);
  } while (searchDir !== searched.at(-1));

  return RuntimeException.asErr('Failed to find libnest config file', {
    details: {
      searched
    }
  });
}

function importDefault(filepath: string): ResultAsync<unknown, typeof RuntimeException.Instance>;
function importDefault(
  importFn: () => Promise<{ [key: string]: unknown }>
): ResultAsync<unknown, typeof RuntimeException.Instance>;
function importDefault(
  argument: (() => Promise<{ [key: string]: unknown }>) | string
): ResultAsync<unknown, typeof RuntimeException.Instance> {
  let importFn: () => Promise<{ [key: string]: unknown }>;
  let context: string;
  if (typeof argument === 'function') {
    importFn = argument;
    context = `module inferred as return value from function '${importFn.name || 'anonymous'}'`;
  } else {
    importFn = (): Promise<{ [key: string]: unknown }> => import(argument);
    context = argument;
  }
  return fromAsyncThrowable(
    importFn,
    (error) =>
      new RuntimeException(`Failed to import module: ${context}`, {
        cause: error
      })
  )().andThen(({ default: defaultExport }) => {
    if (defaultExport === undefined) {
      return RuntimeException.asErr(`Missing required default export in module: ${context}`);
    }
    return ok(defaultExport);
  });
}

/**
 * Resolves the app container and config options from a config file.
 * @param configFile - The path to the config file.
 * @returns A `ResultAsync` containing the config options on success, or an error message on failure.
 */
function loadConfig(configFile: string): ResultAsync<UserConfigOptions, typeof RuntimeException.Instance> {
  return importDefault(configFile).andThen((config) => {
    const result = $UserConfigOptions.safeParse(config);
    if (!result.success) {
      return RuntimeException.asAsyncErr(`Invalid format for default export in config file: ${configFile}`, {
        details: {
          issues: result.error.issues
        }
      });
    }
    return ok(result.data);
  });
}

/**
 * Resolves the app container from a user config
 * @param config - The user config
 * @returns A `ResultAsync` containing the app container on success, or an error message on failure.
 */
function loadAppContainer(config: UserConfigOptions): ResultAsync<AppContainer, typeof RuntimeException.Instance> {
  return importDefault(config.entry)
    .map(async (appContainer) => await appContainer)
    .andThen((appContainer) => {
      if (!(appContainer instanceof AppContainer)) {
        return RuntimeException.asAsyncErr(
          'Failed to initialize app: default export from entry module is not an AppContainer'
        );
      }
      return ok(appContainer);
    });
}

/**
 * Runs the dev server using the app container from a config file.
 * @param configFile - The path to the config file.
 * @returns A `ResultAsync` containing void on success, or an error message on failure.
 */
function runDev(configFile: string): ResultAsync<void, typeof RuntimeException.Instance> {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development' satisfies NodeEnv;
  }
  return resolveAbsoluteImportPathFromCwd(configFile)
    .asyncAndThen(loadConfig)
    .andThen((config) => {
      return loadAppContainer(config).map(async (appContainer) => {
        if (config.globals) {
          Object.entries(config.globals).forEach(([key, value]) => {
            Object.defineProperty(globalThis, key, {
              value,
              writable: false
            });
          });
        }
        await appContainer.bootstrap();
      });
    });
}

async function build(options: { configFile: string; outfile: string }) {
  const { default: config } = (await import(options.configFile)) as { default: UserConfigOptions };
  const entry = `const __appContainer = await (${config.entry.toString()})().then((mod) => mod.default);`;
  await esbuild.build({
    banner: {
      js: "Object.defineProperties(globalThis, { __dirname: { value: import.meta.dirname, writable: false }, __filename: { value: import.meta.filename, writable: false }, require: { value: (await import('module')).createRequire(import.meta.url), writable: false } });"
    },
    bundle: true,
    define: {
      'process.env.NODE_ENV': "'production'"
    },
    external: ['@nestjs/microservices', '@nestjs/websockets/socket-module', 'class-transformer', 'class-validator'],
    format: 'esm',
    keepNames: true,
    outfile: options.outfile,
    platform: 'node',
    plugins: [
      {
        name: 'esbuild-plugin-swc',
        setup: (build) => {
          build.onLoad({ filter: /\.(ts)$/ }, async (args) => {
            const code = await fs.promises.readFile(args.path, 'utf-8');
            const result = await swc.transform(code, {
              filename: args.path,
              isModule: true,
              jsc: {
                parser: {
                  decorators: true,
                  syntax: 'typescript'
                },
                target: 'esnext',
                transform: {
                  decoratorMetadata: true,
                  legacyDecorator: true
                }
              },
              module: {
                type: 'es6'
              }
            });
            return {
              contents: result.code,
              loader: 'js'
            };
          });
        }
      }
    ],
    stdin: {
      contents: `${entry}; await __appContainer; await __appContainer.bootstrap();`,
      loader: 'ts',
      resolveDir: path.dirname(options.configFile)
    },
    target: ['node22', 'es2022']
  });
}

export { build, findConfig, importDefault, loadAppContainer, loadConfig, resolveAbsoluteImportPathFromCwd, runDev };
