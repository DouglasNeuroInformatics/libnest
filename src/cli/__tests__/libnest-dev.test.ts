import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';

import { createExec, process } from '../../testing/helpers/cli.js';

const { runDev } = vi.hoisted(() => ({
  runDev: vi.fn()
}));

vi.mock('../../utils/meta.utils.js', () => ({
  runDev
}));

const exec = createExec({
  entry: '../libnest-dev.js',
  root: import.meta.dirname
});

describe('libnest-dev', () => {
  it('should output help', async () => {
    const result = await exec(['--help']);
    expect(result).toMatchObject({ exitCode: 0 });
    expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('Usage: libnest-dev'));
  });
  it('should override the exit callback', async () => {
    const exitOverride = vi.spyOn(Command.prototype, 'exitOverride');
    await exec(['--help']);
    vi.spyOn(process, 'ppid', 'get').mockReturnValueOnce(100 as any);
    const kill = vi.spyOn(process, 'kill').mockImplementationOnce(() => null!);
    const exit = vi.spyOn(process, 'exit').mockImplementationOnce(() => null!);
    expect(exitOverride).toHaveBeenCalled();
    exitOverride.mock.lastCall![0]!({ exitCode: 1 } as any);
    expect(kill).toHaveBeenCalledExactlyOnceWith(100);
    expect(exit).toHaveBeenCalledExactlyOnceWith(1);
  });
  it('should set the action', async () => {
    const action = vi.spyOn(Command.prototype, 'action');
    await exec(['--help']);
    const callback = action.mock.lastCall![0];
    expect(callback).toBeTypeOf('function');
  });
  it('should throw an error if LIBNEST_CONFIG_FILEPATH is not defined', async () => {
    const action = vi.spyOn(Command.prototype, 'action');
    await exec(['--help']);
    const callback = action.mock.lastCall![0];
    vi.spyOn(process.env as any, 'LIBNEST_CONFIG_FILEPATH', 'get').mockReturnValueOnce(undefined);
    await expect(() => (callback as any)()).rejects.toThrow(
      expect.objectContaining({
        exitCode: 1
      })
    );
  });
  it('should call the runDev function', async () => {
    const action = vi.spyOn(Command.prototype, 'action');
    await exec(['--help']);
    const callback = action.mock.lastCall![0];
    vi.spyOn(process.env as any, 'LIBNEST_CONFIG_FILEPATH', 'get').mockReturnValueOnce('/path/to/config.js');
    const mapErr = vi.fn();
    runDev.mockReturnValueOnce({ mapErr });
    (callback as any)();
    expect(runDev).toHaveBeenCalledOnce();
    const programError = vi.spyOn(Command.prototype, 'error').mockImplementationOnce(() => null!);
    const errorHandler = mapErr.mock.lastCall![0];
    errorHandler(new Error('An error occurred'));
    expect(programError).toHaveBeenCalledExactlyOnceWith('Error: An error occurred', { exitCode: 1 });
  });
});
