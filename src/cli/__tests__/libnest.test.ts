import { Command } from 'commander';
import { err, ok } from 'neverthrow';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CommandRunner } from '../../testing/helpers/cli.js';

const { resolveAbsoluteImportPath, resolveAbsolutePath } = vi.hoisted(() => ({
  resolveAbsoluteImportPath: vi.fn(),
  resolveAbsolutePath: vi.fn()
}));

vi.mock('../../meta/resolve.js', () => ({
  resolveAbsoluteImportPath,
  resolveAbsolutePath
}));

const command = new CommandRunner({
  entry: '../libnest.js',
  root: import.meta.dirname
});

describe('libnest', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should output help', async () => {
    const parseAsync = vi.spyOn(Command.prototype, 'parseAsync');
    const result = await command.run(['--help']);
    expect(parseAsync).toHaveBeenCalledExactlyOnceWith(['node', '../libnest.js', '--help']);
    expect(result.error?.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage: @douglasneuroinformatics/libnest');
  });

  it('should throw an InvalidArgumentError if the config path cannot be resolved', async () => {
    const parseAsync = vi.spyOn(Command.prototype, 'parseAsync');
    resolveAbsoluteImportPath.mockReturnValueOnce(err('Failed'));
    const result = await command.run(['-c', 'libnest.config.ts'], {
      cwd: '/app'
    });
    expect(parseAsync).toHaveBeenCalledExactlyOnceWith(['node', '../libnest.js', '-c', 'libnest.config.ts']);
    expect(resolveAbsoluteImportPath).toHaveBeenLastCalledWith('libnest.config.ts', '/app');
    expect(result.error).toMatchObject({ code: 'commander.invalidArgument', exitCode: 1 });
  });

  it('should source the env file', async () => {
    const hook = vi.spyOn(Command.prototype, 'hook');
    resolveAbsoluteImportPath.mockReturnValueOnce(ok('/root/path/to/file.js'));
    resolveAbsolutePath.mockReturnValueOnce(ok('/root/path/to/file.js'));
    const result = await command.run(['-c', 'libnest.config.ts', '--env-file', '.env']);
    expect(hook).toHaveBeenCalledExactlyOnceWith('preSubcommand', expect.any(Function));
    const callback = hook.mock.lastCall![1];
    const getOptionValue = vi.fn();
    getOptionValue.mockReturnValueOnce(['.env']);
    await callback({ getOptionValue } as any, null!);
    expect(getOptionValue).toHaveBeenCalled();
    expect(result.mocks.process.loadEnvFile).toHaveBeenCalledExactlyOnceWith('.env');
  });

  it('should pass the resolved config file to the subcommand', async () => {
    const hook = vi.spyOn(Command.prototype, 'hook');
    resolveAbsoluteImportPath.mockReturnValueOnce(ok('/root/path/to/file.js'));
    await command.run(['-c', 'libnest.config.ts']);
    expect(hook).toHaveBeenCalledExactlyOnceWith('preSubcommand', expect.any(Function));
    const callback = hook.mock.lastCall![1];
    const getOptionValue = vi.fn();
    await callback({ getOptionValue } as any, null!);
    expect(getOptionValue).toHaveBeenCalled();
  });
});
