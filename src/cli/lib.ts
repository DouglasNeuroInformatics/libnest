import * as fs from 'node:fs';
import * as path from 'node:path';

import { err, ok, ResultAsync } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

export type ConfigOptions = z.infer<typeof $ConfigOptions>;
export const $ConfigOptions = z.object({
  entry: z.string().min(1),
  globals: z.record(z.unknown()).optional()
});

export type BootstrapFunction = z.infer<typeof $BootstrapFunction>;
export const $BootstrapFunction = z.function().returns(z.promise(z.void()));

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

export function importModule(filepath: string): ResultAsync<{ [key: string]: unknown }, string> {
  return ResultAsync.fromThrowable(
    () => import(filepath) as Promise<{ [key: string]: unknown }>,
    (error) => {
      console.error(error);
      return `Failed to import module: ${filepath}`;
    }
  )();
}

export function importDefault<TSchema extends z.ZodTypeAny>(
  filename: string,
  schema: TSchema
): ResultAsync<z.TypeOf<TSchema>, string> {
  return resolveAbsoluteImportPath(filename).asyncAndThen((filepath) => {
    return importModule(filepath).andThen(({ default: defaultExport }) => {
      if (defaultExport === undefined) {
        return err(`Missing required default export in module: ${filepath}`);
      }
      const result = schema.safeParse(defaultExport);
      if (!result.success) {
        console.error(result.error.issues);
        return err(`Invalid default export in module: ${filepath}`);
      }
      return ok(result.data as z.TypeOf<TSchema>);
    });
  });
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
