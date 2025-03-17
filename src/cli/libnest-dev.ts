import * as process from 'node:process';

import { Command, CommanderError } from 'commander';

const program = new Command();

const { runDev } = await import('../utils/meta.utils.js');

program.exitOverride((err) => {
  if (err instanceof CommanderError) {
    process.kill(0); // kill all processes in group to stop watch mode
    throw err; // for test purposes
  }
});

program.action(async function () {
  const configFile = process.env.LIBNEST_CONFIG_FILEPATH;
  if (!configFile) {
    return program.error(`error: environment variable 'LIBNEST_CONFIG_FILEPATH' must be defined`);
  }
  await runDev(configFile).mapErr((error) => {
    program.error(error.toString(), { exitCode: 1 });
  });
});

await program.parseAsync(process.argv);
