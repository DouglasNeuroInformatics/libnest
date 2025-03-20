import * as module from 'node:module';
import * as process from 'node:process';

import { Command, InvalidArgumentError } from 'commander';

import { resolveAbsoluteImportPath } from '../meta/resolve.js';

const require = module.createRequire(import.meta.url);

const { name, version } = require('../../package.json');

const program = new Command();
program.name(name);
program.version(version);
program.allowExcessArguments(false);
program.allowUnknownOption(false);
program.requiredOption('-c, --config-file <path>', 'path to the config file', (filename) => {
  const result = resolveAbsoluteImportPath(filename, process.cwd());
  if (result.isErr()) {
    throw new InvalidArgumentError(result.error.message);
  }
  return result.value;
});

program.command('build', 'build application for production');
program.command('dev', 'run application in development mode');

program.hook('preSubcommand', (command) => {
  const configFile = command.getOptionValue('configFile');
  process.env.LIBNEST_CONFIG_FILEPATH = configFile;
});

await program.parseAsync(process.argv);
