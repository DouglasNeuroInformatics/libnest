import * as path from 'node:path';
import * as process from 'node:process';

import { Command } from 'commander';

import { build } from '../utils/meta.utils.js';

const program = new Command();

program.action(async function () {
  const configFile = process.env.LIBNEST_CONFIG_FILEPATH;
  if (!configFile) {
    return program.error(`error: environment variable 'LIBNEST_CONFIG_FILEPATH' must be defined`);
  }
  await build({
    configFile,
    outfile: path.resolve(import.meta.dirname, '../../build/server.js')
  });
});

await program.parseAsync(process.argv);
