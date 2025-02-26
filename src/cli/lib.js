import * as fs from 'node:fs';
import * as path from 'node:path';

import { BaseException, RuntimeException } from '@douglasneuroinformatics/libjs';
import { Err, fromAsyncThrowable, Ok, ok } from 'neverthrow';
import { z } from 'zod';

/**
 * We cannot use `instanceof` here, since we cannot import TypeScript from JavaScript files.
 * @see https://github.com/vitest-dev/vitest/issues/5999
 * @typedef {import('../core/app/app.container.js').AppContainerType} AppContainerType
 */

/** @typedef {import('../config/index.js').ConfigOptions} ConfigOptions */

/** @type {import('zod').ZodType<ConfigOptions>} */
const $ConfigOptions = z.object({
  entry: z.string().min(1),
  globals: z.record(z.unknown()).optional()
});

/** @type {import('zod').ZodType<AppContainerType>} */
const $AppContainer = z.object({
  bootstrap: z.function().returns(z.promise(z.void())),
  createNestApplication: z.function().returns(z.promise(z.any()))
});

/**
 * Resolves an import path to an absolute file path and validates that it exists and is a valid file.
 * @param {string} filename - The import path to resolve.
 * @returns {import('neverthrow').Result<string, typeof RuntimeException.Instance>} A `Result` containing the absolute file path on success, or an error message on failure.
 */
function resolveAbsoluteImportPath(filename) {
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
 * @param {string} filepath - The path to the module to import.
 * @returns {import('neverthrow').ResultAsync<Record<string, unknown>, typeof RuntimeException.Instance>} A `ResultAsync` containing the imported module on success, or an error message on failure.
 */
function importModule(filepath) {
  return fromAsyncThrowable(
    () => import(filepath),
    (error) => {
      console.error(error);
      return new RuntimeException(`Failed to import module: ${filepath}`);
    }
  )();
}

/**
 * Imports the default export from a module
 * @param {string} filename - The path to the module to import.
 * @returns {import('neverthrow').ResultAsync<unknown, typeof RuntimeException.Instance>} A `ResultAsync` containing the validated default export on success, or an error message on failure.
 */
function importDefault(filename) {
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
 * @returns {import('neverthrow').ResultAsync<{ appContainer: AppContainerType; config: ConfigOptions }, typeof RuntimeException.Instance>} A `ResultAsync` containing the app container and config options on success, or an error message on failure.
 */
function loadConfig(configFile) {
  return importDefault(configFile)
    .andThen((config) => {
      const result = $ConfigOptions.safeParse(config);
      if (!result.success) {
        console.error(result.error.issues);
        return RuntimeException.asAsyncErr(`Invalid format for default export in config file: ${configFile}`);
      }
      return ok(result.data);
    })
    .andThen((config) => {
      return importDefault(config.entry).andThen((exportResult) => {
        if (!(exportResult instanceof Err || exportResult instanceof Ok)) {
          return RuntimeException.asAsyncErr(`Invalid default export for entry file '${config.entry}': not a result`);
        } else if (exportResult.isErr()) {
          if (exportResult.error instanceof BaseException) {
            console.error(exportResult.error.details);
            return RuntimeException.asAsyncErr(`Failed to initialize app due to a ${exportResult.error.name}`);
          }
          console.error(exportResult.error);
          return RuntimeException.asAsyncErr('Failed to initialize app due to a unexpected error');
        }
        const validationResult = $AppContainer.safeParse(exportResult.value);
        if (!validationResult.success) {
          return RuntimeException.asAsyncErr(
            'Failed to initialize app: exported result from entry file does not contain valid AppContainer'
          );
        }
        return ok({ appContainer: validationResult.data, config });
      });
    });
}

/**
 * Runs the dev server using the app container from a config file.
 * @param {string} configFile - The path to the config file.
 * @returns {import('neverthrow').ResultAsync<void, typeof RuntimeException.Instance>} A `ResultAsync` containing void on success, or an error message on failure.
 */
function runDev(configFile) {
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
