import * as fs from 'node:fs';
import * as module from 'node:module';
import * as path from 'node:path';

import { Command, InvalidArgumentError } from 'commander';
import type { PackageJson } from 'type-fest';

module.register('@swc-node/register/esm', import.meta.url);

const require = module.createRequire(import.meta.url);

const { name, version } = require('@douglasneuroinformatics/libnest/package.json') as Required<
  Pick<PackageJson, 'name' | 'version'>
>;

const program = new Command();
program.name(name);
program.version(version);
program.allowExcessArguments(false);

const dev = program.command('dev');

dev.argument('<entry>', 'the entry file', (filename) => {
  const filepath = path.join(process.cwd(), filename);
  const extension = path.extname(filepath);
  if (!fs.existsSync(filepath)) {
    throw new InvalidArgumentError(`File does not exist: ${filepath}`);
  } else if (!fs.lstatSync(filepath).isFile()) {
    throw new InvalidArgumentError(`Not a file: ${filepath}`);
  } else if (!(extension === '.js' || extension === '.ts')) {
    throw new InvalidArgumentError(`Unexpected file extension '${extension}': must be '.js' or '.ts'`);
  }
  return filepath;
});

dev.action(async (entry: string) => {
  const { default: main } = (await import(entry)) as { [key: string]: any };
  if (typeof main === 'undefined') {
    program.error(`Missing required default export from entry file: ${entry}`, { exitCode: 1 });
  } else if (typeof main !== 'function') {
    program.error(`Error: Default export from entry file '${entry}' is not a function`, { exitCode: 1 });
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  main();
});

program.parse(process.argv);
