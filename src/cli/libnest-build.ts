import * as process from 'node:process';

import { Command } from 'commander';

import { bundle } from '../utils/build.utils.js';

const program = new Command();

program.action(async function () {
  const configFile = process.env.LIBNEST_CONFIG_FILEPATH;
  if (!configFile) {
    return program.error(`error: environment variable 'LIBNEST_CONFIG_FILEPATH' must be defined`);
  }
  await bundle({ configFile }).mapErr((error) => {
    program.error(error.toString(), { exitCode: 1 });
  });
});

await program.parseAsync(process.argv);
