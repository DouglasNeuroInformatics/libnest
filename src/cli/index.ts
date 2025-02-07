import * as module from 'node:module';

import { InvalidArgumentError, program } from 'commander';

import { $BootstrapFunction, $ConfigOptions } from './schemas.js';
import { importDefault, resolveAbsoluteImportPath } from './utils.js';

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

    const configResult = await importDefault(configFile, $ConfigOptions);
    if (configResult.isErr()) {
      program.error(configResult.error, { exitCode: 1 });
    }

    const { entry, globals } = configResult.value;

    const bootstrapResult = await importDefault(entry, $BootstrapFunction);
    if (bootstrapResult.isErr()) {
      program.error(bootstrapResult.error, { exitCode: 1 });
    }

    if (globals) {
      Object.entries(globals).forEach(([key, value]) => {
        Object.defineProperty(globalThis, key, {
          value,
          writable: false
        });
      });
    }

    await bootstrapResult.value();
  });

await program.parseAsync(process.argv);

export type { ConfigOptions } from './schemas.js';
