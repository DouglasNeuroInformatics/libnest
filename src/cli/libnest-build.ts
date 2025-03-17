import * as process from 'node:process';

import { Command } from 'commander';

const program = new Command();

program.action(async function () {
  const configFile = process.env.LIBNEST_CONFIG_FILEPATH;
  if (!configFile) {
    return program.error(`error: environment variable 'LIBNEST_CONFIG_FILEPATH' must be defined`);
  }
  return Promise.resolve();
});

await program.parseAsync(process.argv);
