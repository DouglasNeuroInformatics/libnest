import * as fs from 'node:fs';
import * as path from 'node:path';

import { BaseException, RuntimeException } from '@douglasneuroinformatics/libjs';
import { Err, fromAsyncThrowable, Ok, ok, Result, ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { AppContainer } from '../core/app/app.container.js';

import type { ConfigOptions } from '../config/index.js';
import type { NodeEnv } from '../config/schema.js';

const $ConfigOptions: z.ZodType<ConfigOptions> = z.object({
  entry: z.string().min(1),
  globals: z.record(z.unknown()).optional()
});

/**
 * Resolves an import path to an absolute file path and validates that it exists and is a valid file.
 * @param filename - The import path to resolve.
 * @returns A `Result` containing the absolute file path on success, or an error message on failure.
 */
function resolveAbsoluteImportPath(filename: string): Result<string, typeof RuntimeException.Instance> {
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

/**
 * Imports a module from a given file path.
 * @param filepath - The path to the module to import.
 * @returns A `ResultAsync` containing the imported module on success, or an error message on failure.
 */
function importModule(filepath: string): ResultAsync<{ [key: string]: unknown }, typeof RuntimeException.Instance> {
  return fromAsyncThrowable(
    async () => import(filepath) as Promise<{ [key: string]: unknown }>,
    (error) => {
      return new RuntimeException(`Failed to import module: ${filepath}`, {
        cause: error
      });
    }
  )();
}

/**
 * Imports the default export from a module
 * @param filename - The path to the module to import.
 * @returns A `ResultAsync` containing the validated default export on success, or an error message on failure.
 */
function importDefault(filename: string): ResultAsync<unknown, typeof RuntimeException.Instance> {
  return resolveAbsoluteImportPath(filename).asyncAndThen((filepath) => {
    return importModule(filepath).andThen(({ default: defaultExport }) => {
      if (defaultExport === undefined) {
        return RuntimeException.asErr(`Missing required default export in module: ${filepath}`);
      }
      return ok(defaultExport);
    });
  });
}

/**
 * Resolves the app container and config options from a config file.
 * @param {string} configFile - The path to the config file.
 * @returns A `ResultAsync` containing the app container and config options on success, or an error message on failure.
 */
function loadConfig(
  configFile: string
): ResultAsync<{ appContainer: AppContainer; config: ConfigOptions }, typeof RuntimeException.Instance> {
  return importDefault(configFile)
    .andThen((config) => {
      const result = $ConfigOptions.safeParse(config);
      if (!result.success) {
        return RuntimeException.asAsyncErr(`Invalid format for default export in config file: ${configFile}`, {
          details: {
            issues: result.error.issues
          }
        });
      }
      return ok(result.data);
    })
    .andThen((config) => {
      return importDefault(config.entry).andThen((exportResult) => {
        if (!(exportResult instanceof Err || exportResult instanceof Ok)) {
          return RuntimeException.asAsyncErr(`Invalid default export for entry file '${config.entry}': not a result`);
        } else if (exportResult.isErr()) {
          if (exportResult.error instanceof BaseException) {
            return RuntimeException.asAsyncErr(`Failed to initialize application`, {
              cause: exportResult.error
            });
          }
          return RuntimeException.asAsyncErr('Failed to initialize app due to a unexpected error');
        }
        const appContainer: unknown = exportResult.value;
        if (!(appContainer instanceof AppContainer)) {
          return RuntimeException.asAsyncErr(
            'Failed to initialize app: exported result from entry file does not contain valid AppContainer'
          );
        }
        return ok({ appContainer, config });
      });
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
  return loadConfig(configFile).map(async ({ appContainer, config }) => {
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
}

export { importDefault, importModule, loadConfig, resolveAbsoluteImportPath, runDev };
