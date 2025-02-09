import * as fs from 'node:fs';
import * as path from 'node:path';

import { err, ok, ResultAsync } from 'neverthrow';
import { z } from 'zod';

/** @type {z.ZodType<Libnest.ConfigOptions>} */
const $ConfigOptions = z.object({
  entry: z.string().min(1),
  globals: z.record(z.unknown()).optional()
});

const $BootstrapFunction = z.function().returns(z.promise(z.void()));

/**
 * Resolves an absolute import path for a given filename.
 *
 * @param {string} filename - The filename to resolve.
 * @returns {import('neverthrow').Result<string, string>} A result containing the resolved file path or an error message.
 */
function resolveAbsoluteImportPath(filename) {
  const filepath = path.resolve(process.cwd(), filename);
  const extension = path.extname(filepath);
  if (!fs.existsSync(filepath)) {
    return err(`File does not exist: ${filepath}`);
  } else if (!fs.lstatSync(filepath).isFile()) {
    return err(`Not a file: ${filepath}`);
  } else if (!(extension === '.js' || extension === '.ts')) {
    return err(`Unexpected file extension '${extension}': must be '.js' or '.ts'`);
  }
  return ok(filepath);
}

/**
 * Dynamically imports a module from a given file path.
 *
 * @param {string} filepath - The path to the module.
 * @returns {import('neverthrow').ResultAsync<Object<string, unknown>, string>} A result containing the imported module or an error message.
 */
function importModule(filepath) {
  return ResultAsync.fromThrowable(
    () => import(filepath),
    (error) => {
      console.error(error);
      return `Failed to import module: ${filepath}`;
    }
  )();
}

/**
 * Imports the default export of a module and validates it against a given schema.
 *
 * @template {z.ZodTypeAny} TSchema
 * @param {string} filename - The filename of the module.
 * @param {TSchema} schema - The Zod schema to validate the default export.
 * @returns {import('neverthrow').ResultAsync<z.infer<TSchema>, string>} A result containing the validated default export or an error message.
 */
function importDefault(filename, schema) {
  return resolveAbsoluteImportPath(filename).asyncAndThen((filepath) =>
    importModule(filepath).andThen(({ default: defaultExport }) => {
      if (defaultExport === undefined) {
        return err(`Missing required default export in module: ${filepath}`);
      }
      const result = schema.safeParse(defaultExport);
      if (!result.success) {
        console.error(result.error.issues);
        return err(`Invalid default export in module: ${filepath}`);
      }
      return ok(result.data);
    })
  );
}

/**
 * Resolves a bootstrap function from a given configuration file.
 *
 * @param {string} configFile - The path to the configuration file.
 * @returns {import('neverthrow').ResultAsync<Function, string>} A result containing the bootstrap function or an error message.
 */
function resolveBootstrapFunction(configFile) {
  return importDefault(configFile, $ConfigOptions).andThen(({ entry, globals }) =>
    importDefault(entry, $BootstrapFunction).map((bootstrap) => {
      if (globals) {
        Object.entries(globals).forEach(([key, value]) => {
          Object.defineProperty(globalThis, key, {
            value,
            writable: false
          });
        });
      }
      return bootstrap;
    })
  );
}

/**
 * Runs the development mode by resolving and executing the bootstrap function.
 *
 * @param {string} configFile - The path to the configuration file.
 * @returns {import('neverthrow').ResultAsync<void, string>} A result indicating success or failure.
 */
function runDev(configFile) {
  return resolveBootstrapFunction(configFile).map(async (bootstrap) => {
    await bootstrap();
  });
}

export {
  $BootstrapFunction,
  $ConfigOptions,
  importDefault,
  importModule,
  resolveAbsoluteImportPath,
  resolveBootstrapFunction,
  runDev
};
