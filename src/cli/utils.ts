import * as fs from 'node:fs';
import * as path from 'node:path';

import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { z } from 'zod';

import { $BootstrapFunction, $ConfigOptions, type BootstrapFunction } from './schemas.js';

export function resolveAbsoluteImportPath(filename: string): Result<string, string> {
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

export async function importDefault<TSchema extends z.ZodTypeAny>(
  filepath: string,
  schema: TSchema
): Promise<Result<z.TypeOf<TSchema>, string>> {
  let defaultExport: unknown;
  try {
    const exports = (await import(filepath)) as { [key: string]: unknown };
    defaultExport = exports.default;
  } catch (error) {
    console.error(error);
    return err(`Failed to import module: ${filepath}`);
  }
  if (defaultExport === undefined) {
    return err(`Missing required default export in file '${filepath}'`);
  }
  const result = await schema.safeParseAsync(defaultExport);
  if (!result.success) {
    console.error(result.error.message);
    return err(`Invalid default export in file '${filepath}'`);
  }
  return ok(result.data);
}

export async function resolveBootstrapFunction(configFile: string): Promise<Result<BootstrapFunction, string>> {
  const configResult = await importDefault(configFile, $ConfigOptions);

  if (configResult.isErr()) {
    return err(configResult.error);
  }

  const { entry, globals } = configResult.value;

  const bootstrapResult = await importDefault(entry, $BootstrapFunction);
  if (bootstrapResult.isErr()) {
    return bootstrapResult;
  }

  if (globals) {
    Object.entries(globals).forEach(([key, value]) => {
      Object.defineProperty(globalThis, key, {
        value,
        writable: false
      });
    });
  }

  return bootstrapResult;
}
