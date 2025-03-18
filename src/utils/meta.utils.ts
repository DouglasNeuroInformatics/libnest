import * as fs from 'node:fs';
import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import * as swc from '@swc/core';
import * as lexer from 'es-module-lexer';
import type { Plugin } from 'esbuild';
import { fromAsyncThrowable, ok, Result, ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { AppContainer } from '../app/app.container.js';

import type { NodeEnv } from '../schemas/env.schema.js';
import type { UserConfigOptions } from '../user-config.js';

await lexer.init;

type BuildOptions = {
  entrySpecifier: string;
  outfile: string;
  resolveDir: string;
};

const $UserConfigOptions: z.ZodType<UserConfigOptions> = z.object({
  // cannot use zod function here as we cannot have any wrappers apply and screw up toString representation
  entry: z.custom<(...args: any[]) => any>((arg) => typeof arg === 'function'),
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

function parseEntryFromFunction(entry: (...args: any[]) => any): Result<string, typeof RuntimeException.Instance> {
  const source = entry.toString();
  const [imports] = lexer.parse(source);
  if (imports.length !== 1) {
    return RuntimeException.asErr(`Entry function must include exactly one import: found ${imports.length}`, {
      details: {
        source
      }
    });
  }
  const importSpecifier = imports[0]!;
  if (importSpecifier.t !== lexer.ImportType.Dynamic) {
    return RuntimeException.asErr(
      `Entry function must contain dynamic import: found ${lexer.ImportType[importSpecifier.t]}`,
      {
        details: {
          source
        }
      }
    );
  } else if (!importSpecifier.n) {
    return RuntimeException.asErr('Dynamic import in entry function must import a string literal', {
      details: {
        source
      }
    });
  }
  return ok(importSpecifier.n);
}

const swcPlugin = (): Plugin => {
  return {
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
  };
};

const build = fromAsyncThrowable(
  async ({ entrySpecifier, outfile, resolveDir }: BuildOptions) => {
    const esbuild = await import('esbuild');
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
      outfile: outfile,
      platform: 'node',
      plugins: [swcPlugin()],
      stdin: {
        contents: `import __appContainer from "${entrySpecifier}"; await __appContainer; await __appContainer.bootstrap();`,
        loader: 'ts',
        resolveDir: resolveDir
      },
      target: ['node22', 'es2022']
    });
  },
  (err) => {
    return new RuntimeException('Failed to build application', {
      cause: err
    });
  }
);

function bundle({
  configFile,
  outfile
}: {
  configFile: string;
  outfile: string;
}): ResultAsync<void, typeof RuntimeException.Instance> {
  return loadConfig(configFile)
    .andThen((config) => parseEntryFromFunction(config.entry))
    .andThen((entrySpecifier) => {
      return build({
        entrySpecifier,
        outfile,
        resolveDir: path.dirname(configFile)
      });
    });
}

export {
  build,
  bundle,
  findConfig,
  importDefault,
  loadAppContainer,
  loadConfig,
  parseEntryFromFunction,
  resolveAbsoluteImportPathFromCwd,
  runDev,
  swcPlugin
};
