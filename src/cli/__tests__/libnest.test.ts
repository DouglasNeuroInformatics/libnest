import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';

import { setupCommandTest } from '../../testing/helpers/cli.js';

vi.doMock('../utils/meta.utils.js', () => ({ resolveAbsoluteImportPathFromCwd }));

const { exec, process } = setupCommandTest({
  entry: '../libnest.js',
  root: import.meta.dirname
});

const { resolveAbsoluteImportPathFromCwd } = vi.hoisted(() => ({
  resolveAbsoluteImportPathFromCwd: vi.fn()
}));

describe('libnest', () => {
  it('should output help', async () => {
    const parseAsync = vi.spyOn(Command.prototype, 'parseAsync');
    const result = await exec(['--help']);
    expect(parseAsync).toHaveBeenCalledExactlyOnceWith(['node', '../libnest.js', '--help']);
    expect(result).toMatchObject({ exitCode: 0 });
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringContaining('Usage: @douglasneuroinformatics/libnest')
    );
  });
  // it('should throw an InvalidArgumentError if the config path cannot be resolved', async () => {
  //   const parseAsync = vi.spyOn(Command.prototype, 'parseAsync');
  //   resolveAbsoluteImportPathFromCwd.mockReturnValueOnce(err('Failed'));
  //   await exec(['-c', 'libnest.config.ts']);
  //   expect(parseAsync).toHaveBeenCalledExactlyOnceWith(['node', '../libnest.js', '-c', 'libnest.config.ts']);

  //   expect(resolveAbsoluteImportPathFromCwd).toHaveBeenLastCalledWith('libnest.config.ts');
  //   // expect(result).toMatchObject({ code: 'commander.invalidArgument', exitCode: 1 });
  // });
});
