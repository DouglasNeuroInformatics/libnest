import * as module from 'node:module';

import { CommanderError, InvalidArgumentError, program } from 'commander';

module.register('@swc-node/register/esm', import.meta.url);

const { resolveAbsoluteImportPathFromCwd, runDev } = await import('../utils/meta.utils.js');

// kill all processes in group to stop watch mode
const kill = () => process.kill(0);

program.exitOverride((err) => {
  if (err instanceof CommanderError) {
    kill();
  }
});

program.on('--help', () => {
  kill();
});

program
  .requiredOption('-c, --config-file <path>', 'path to the config file', (filename) => {
    const result = resolveAbsoluteImportPathFromCwd(filename);
    if (result.isErr()) {
      throw new InvalidArgumentError(result.error.message);
    }
    return result.value;
  })
  .action(async function () {
    /** @type {{ configFile: string }} */
    const { configFile } = this.opts();
    await runDev(configFile).mapErr((error) => {
      program.error(error.toString(), { exitCode: 1 });
    });
  });

await program.parseAsync();
