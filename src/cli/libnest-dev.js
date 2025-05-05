import * as module from 'node:module';
import * as process from 'node:process';

import { Command } from 'commander';

if (process.env.LIBNEST_JAVASCRIPT_RUNTIME === 'node') {
  module.register('@swc-node/register/esm', import.meta.url);
}

const { runDev } = await import('../meta/dev.js');

const program = new Command();

program.exitOverride((err) => {
  if (err.code !== 'LIBNEST_DEV_ERROR') {
    process.kill(process.ppid);
    process.exit(err.exitCode);
  }
});

program.option('--no-watch', 'disable watch mode');

program.action(async function () {
  const configFile = process.env.LIBNEST_CONFIG_FILEPATH;
  if (!configFile) {
    return program.error(`error: environment variable 'LIBNEST_CONFIG_FILEPATH' must be defined`);
  }
  globalThis.__LIBNEST_STATIC = { configFile };
  await runDev(configFile).mapErr((error) => {
    program.error(error.toString(), { code: 'LIBNEST_DEV_ERROR', exitCode: 1 });
  });
});

await program.parseAsync(process.argv);
