import { Command } from 'commander';
import { err, ok } from 'neverthrow';
import { describe, expect, it, vi } from 'vitest';

import { createExec, process } from '../../testing/helpers/cli.js';

const { resolveAbsoluteImportPath, resolveAbsolutePath } = vi.hoisted(() => ({
  resolveAbsoluteImportPath: vi.fn(),
  resolveAbsolutePath: vi.fn()
}));

vi.mock('../../meta/resolve.js', () => ({
  resolveAbsoluteImportPath,
  resolveAbsolutePath
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
    process.cwd.mockReturnValueOnce('/app');
    const parseAsync = vi.spyOn(Command.prototype, 'parseAsync');
    resolveAbsoluteImportPath.mockReturnValueOnce(err('Failed'));
    const result = await exec(['-c', 'libnest.config.ts']);
    expect(parseAsync).toHaveBeenCalledExactlyOnceWith(['node', '../libnest.js', '-c', 'libnest.config.ts']);
    expect(resolveAbsoluteImportPath).toHaveBeenLastCalledWith('libnest.config.ts', '/app');
    expect(result).toMatchObject({ code: 'commander.invalidArgument', exitCode: 1 });
  });
  it('should source the env file', async () => {
    const hook = vi.spyOn(Command.prototype, 'hook');
    resolveAbsoluteImportPath.mockReturnValueOnce(ok('/root/path/to/file.js'));
    resolveAbsolutePath.mockReturnValueOnce(ok('/root/path/to/file.js'));
    await exec(['-c', 'libnest.config.ts', '--env-file', '.env']);
    expect(hook).toHaveBeenCalledExactlyOnceWith('preSubcommand', expect.any(Function));
    const callback = hook.mock.lastCall![1];
    const getOptionValue = vi.fn();
    getOptionValue.mockReturnValueOnce('.env');
    await callback({ getOptionValue } as any, null!);
    expect(getOptionValue).toHaveBeenCalled();
    expect(process.loadEnvFile).toHaveBeenCalledOnce();
  });
  it('should pass the resolved config file to the subcommand', async () => {
    const hook = vi.spyOn(Command.prototype, 'hook');
    resolveAbsoluteImportPath.mockReturnValueOnce(ok('/root/path/to/file.js'));
    await exec(['-c', 'libnest.config.ts']);
    expect(hook).toHaveBeenCalledExactlyOnceWith('preSubcommand', expect.any(Function));
    const callback = hook.mock.lastCall![1];
    const getOptionValue = vi.fn();
    await callback({ getOptionValue } as any, null!);
    expect(getOptionValue).toHaveBeenCalled();
  });
});
