import { Command } from 'commander';
import { err } from 'neverthrow';
import { describe, expect, it, vi } from 'vitest';

import { createExec, process } from '../../testing/helpers/cli.js';

const { resolveAbsoluteImportPathFromCwd } = vi.hoisted(() => ({
  resolveAbsoluteImportPathFromCwd: vi.fn(),
  runDev: vi.fn()
}));

vi.mock('../../utils/meta.utils.js', () => ({
  resolveAbsoluteImportPathFromCwd
}));

const exec = createExec({
  entry: '../libnest.js',
  root: import.meta.dirname
});

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
  it('should throw an InvalidArgumentError if the config path cannot be resolved', async () => {
    const parseAsync = vi.spyOn(Command.prototype, 'parseAsync');
    resolveAbsoluteImportPathFromCwd.mockReturnValueOnce(err('Failed'));
    const result = await exec(['-c', 'libnest.config.ts']);
    expect(parseAsync).toHaveBeenCalledExactlyOnceWith(['node', '../libnest.js', '-c', 'libnest.config.ts']);
    expect(resolveAbsoluteImportPathFromCwd).toHaveBeenLastCalledWith('libnest.config.ts');
    expect(result).toMatchObject({ code: 'commander.invalidArgument', exitCode: 1 });
  });
});
