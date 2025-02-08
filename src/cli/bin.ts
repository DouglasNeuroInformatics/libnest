import * as module from 'node:module';

import { InvalidArgumentError, program } from 'commander';

import { resolveAbsoluteImportPath, resolveBootstrapFunction } from './lib.js';

module.register('@swc-node/register/esm', import.meta.url);

const require = module.createRequire(import.meta.url);

const { name, version } = require('@douglasneuroinformatics/libnest/package.json') as {
  name: string;
  version: string;
};

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
    const { configFile } = this.opts<{ configFile: string }>();
    const result = await resolveBootstrapFunction(configFile);

    if (result.isErr()) {
      program.error(result.error, { exitCode: 1 });
    }

    await result.value();
  });

await program.parseAsync(process.argv);

export type { ConfigOptions } from './lib.js';
