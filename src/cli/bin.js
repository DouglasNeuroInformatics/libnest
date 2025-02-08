#!/usr/bin/env node

import * as module from 'node:module';

import { InvalidArgumentError, program } from 'commander';

import { resolveAbsoluteImportPath, runDev } from './lib.js';

module.register('@swc-node/register/esm', import.meta.url);

const require = module.createRequire(import.meta.url);

/** @type {{ name: string, version: string}} */
const { name, version } = require('@douglasneuroinformatics/libnest/package.json');

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
    const { configFile } = this.opts();
    await runDev(configFile).mapErr((error) => {
      program.error(error, { exitCode: 1 });
    });
  });

await program.parseAsync(process.argv);
