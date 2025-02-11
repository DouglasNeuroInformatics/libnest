import * as fs from 'node:fs';
import * as path from 'node:path';

import { err, ok, Result, ResultAsync } from 'neverthrow';
import { z } from 'zod';

import type { UserConfigOptions } from '../user-config.js';

const $ConfigOptions: z.ZodType<UserConfigOptions> = z.object({
  entry: z.string().min(1),
  globals: z.record(z.unknown()).optional()
});

type BootstrapFunction = z.infer<typeof $BootstrapFunction>;
const $BootstrapFunction = z.function().returns(z.promise(z.void()));

/**
 * Resolves an import path to an absolute file path and validates that it exists and is a valid file.
 * @param filename The import path to resolve.
 * @returns A `Result` containing the absolute file path on success, or an error message on failure.
 */
function resolveAbsoluteImportPath(filename: string): Result<string, string> {
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
 * Imports a module from a given file path.
 * @param filepath The path to the module to import.
 * @returns A `ResultAsync` containing the imported module on success, or an error message on failure.
 */
function importModule(filepath: string): ResultAsync<{ [key: string]: unknown }, string> {
  return ResultAsync.fromThrowable(
    () => import(filepath) as Promise<{ [key: string]: unknown }>,
    (error) => {
      console.error(error);
      return `Failed to import module: ${filepath}`;
    }
  )();
}

/**
 * Imports the default export from a module and validates it against a schema.
 * @param filename The path to the module to import.
 * @param schema The Zod schema to validate the default export against.
 * @returns A `ResultAsync` containing the validated default export on success, or an error message on failure.
 */
function importDefault<TSchema extends z.ZodTypeAny>(
  filename: string,
  schema: TSchema
): ResultAsync<z.infer<TSchema>, string> {
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
      return ok(result.data as z.infer<TSchema>);
    })
  );
}

/**
 * Resolves the bootstrap function from a config file.
 * @param configFile The path to the config file.
 * @returns A `ResultAsync` containing the bootstrap function on success, or an error message on failure.
 */
function resolveBootstrapFunction(configFile: string): ResultAsync<BootstrapFunction, string> {
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
 * Runs the dev server using the bootstrap function from a config file.
 * @param configFile The path to the config file.
 * @returns A `ResultAsync` containing void on success, or an error message on failure.
 */
function runDev(configFile: string): ResultAsync<void, string> {
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
