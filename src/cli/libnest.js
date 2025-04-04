import * as module from 'node:module';
import * as path from 'node:path';
import * as process from 'node:process';

import { Command, InvalidArgumentError, Option } from 'commander';

// no longer necessary once the package is built
if (import.meta.dirname.endsWith('src/cli')) {
  module.register('@swc-node/register/esm', import.meta.url);
}

const { resolveAbsoluteImportPath, resolveAbsolutePath } = await import('../meta/resolve.js');

const require = module.createRequire(import.meta.url);

const { name, version } = require('../../package.json');

/**
 * @template T
 * @param {import('neverthrow').Result<T, any>} result
 * @returns {T}
 */
const parseResult = (result) => {
  if (result.isErr()) {
    throw new InvalidArgumentError(result.error.message);
  }
  return result.value;
};

const program = new Command();
program.name(name);
program.version(version);
program.allowExcessArguments(false);
program.allowUnknownOption(true);
program.requiredOption('-c, --config-file <path>', 'path to the config file', (filename) => {
  return parseResult(resolveAbsoluteImportPath(filename, process.cwd()));
});

program.option('-e, --env-file <path>', 'path to an env file to source', (filename) => {
  return parseResult(resolveAbsolutePath(filename, process.cwd()));
});

program.addOption(
  new Option('-r, --runtime [command]', 'the runtime to use').choices(['bun', 'deno', 'node']).default('node')
);

program.command('build', 'build application for production', {
  executableFile: path.resolve(import.meta.dirname, 'bin/libnest-build')
});
program.command('dev', 'run application in development mode', {
  executableFile: path.resolve(import.meta.dirname, 'bin/libnest-dev')
});

program.hook('preSubcommand', (command) => {
  const envFile = command.getOptionValue('envFile');
  if (envFile) {
    process.loadEnvFile(envFile);
  }
  process.env.LIBNEST_CONFIG_FILEPATH = command.getOptionValue('configFile');
  process.env.LIBNEST_JAVASCRIPT_RUNTIME = command.getOptionValue('runtime');
});

await program.parseAsync(process.argv);
