import * as module from 'node:module';
import * as process from 'node:process';

import { Command } from 'commander';

module.register('@swc-node/register/esm', import.meta.url);

const { runDev } = await import('../meta/dev.js');

const program = new Command();

program.exitOverride((err) => {
  process.kill(process.ppid);
  process.exit(err.exitCode);
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
