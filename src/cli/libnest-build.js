import * as module from 'node:module';
import * as process from 'node:process';

import { Command } from 'commander';

if (process.env.LIBNEST_JAVASCRIPT_RUNTIME === 'node') {
  module.register('@swc-node/register/esm', import.meta.url);
}

const { buildProd } = await import('../meta/build.js');

const program = new Command();

program.option('--verbose');

program.action(async function () {
  const configFile = process.env.LIBNEST_CONFIG_FILEPATH;
  if (!configFile) {
    return program.error(`error: environment variable 'LIBNEST_CONFIG_FILEPATH' must be defined`);
  }
  globalThis.__LIBNEST_STATIC = { configFile };
  const options = this.opts();
  await buildProd({ configFile, verbose: options.verbose }).mapErr((error) => {
    program.error(error.toString(), { exitCode: 1 });
  });
});

await program.parseAsync(process.argv);
