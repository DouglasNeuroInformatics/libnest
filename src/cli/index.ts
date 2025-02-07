import * as fs from 'node:fs';
import * as module from 'node:module';
import * as path from 'node:path';

import { InvalidArgumentError, program } from 'commander';
import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

module.register('@swc-node/register/esm', import.meta.url);

type ConfigOptions = z.infer<typeof $ConfigOptions>;
const $ConfigOptions = z.object({
  entry: z.string().transform((arg, ctx) => {
    const result = resolveAbsoluteImportPath(arg);
    if (result.isErr()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.error
      });
      return z.NEVER;
    }
    return result.value;
  })
});

const $BootstrapFunction = z.function().returns(z.promise(z.void()));

const baseDir = process.cwd();

const require = module.createRequire(import.meta.url);

function resolveAbsoluteImportPath(filename: string): Result<string, string> {
  const filepath = path.resolve(baseDir, filename);
  const extension = path.extname(filepath);
  if (!fs.existsSync(filepath)) {
    err(`File does not exist: ${filepath}`);
  } else if (!fs.lstatSync(filepath).isFile()) {
    err(`Not a file: ${filepath}`);
  } else if (!(extension === '.js' || extension === '.ts')) {
    err(`Unexpected file extension '${extension}': must be '.js' or '.ts'`);
  }
  return ok(filepath);
}

async function importDefault<TSchema extends z.ZodTypeAny>(
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

const { name, version } = require('@douglasneuroinformatics/libnest/package.json') as {
  name: string;
  version: string;
};

program.name(name);
program.version(version);
program.allowExcessArguments(false);

program
  .command('dev')
  .requiredOption('-c, --config-file <path>', 'path to the config file', (filename) => {
    const result = resolveAbsoluteImportPath(filename);
    if (result.isErr()) {
      throw new InvalidArgumentError(result.error);
    }
    return result.value;
  })
  .action(async function () {
    const { configFile } = this.opts<{ configFile: string }>();

    const configResult = await importDefault(configFile, $ConfigOptions);
    if (configResult.isErr()) {
      program.error(configResult.error, { exitCode: 1 });
    }

    const bootstrapResult = await importDefault(configResult.value.entry, $BootstrapFunction);
    if (bootstrapResult.isErr()) {
      program.error(bootstrapResult.error, { exitCode: 1 });
    }

    await bootstrapResult.value();
  });

await program.parseAsync(process.argv);

export type { ConfigOptions };
