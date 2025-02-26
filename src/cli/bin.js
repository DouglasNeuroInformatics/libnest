#!/usr/bin/env node --watch

import * as module from 'node:module';
import * as process from 'node:process';

import { Command, InvalidArgumentError } from 'commander';

import { resolveAbsoluteImportPath, runDev } from './lib.js';

module.register('@swc-node/register/esm', import.meta.url);

const require = module.createRequire(import.meta.url);

/** @type {{ name: string; version: string }} */
const { name, version } = require('../../package.json');

const program = new Command();
program.name(name);
program.version(version);
program.allowExcessArguments(false);

program
  .command('dev')
  .requiredOption('-c, --config-file <path>', 'path to the config file', (filename) => {
    const result = resolveAbsoluteImportPath(filename);
    if (result.isErr()) {
      throw new InvalidArgumentError(result.error.message);
    }
    return result.value;
  })
  .action(async function () {
    /** @type {{ configFile: string }} */
    const { configFile } = this.opts();
    await runDev(configFile).mapErr((error) => {
      program.error(error.toString(), { exitCode: 1 });
    });
  });

await program.parseAsync(process.argv);
