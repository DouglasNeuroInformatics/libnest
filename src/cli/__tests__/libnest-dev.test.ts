import { Command } from 'commander';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CommandRunner } from '../../testing/helpers/cli.js';

const { register, runDev } = vi.hoisted(() => ({
  register: vi.fn(),
  runDev: vi.fn()
}));

vi.mock('node:module', () => ({
  register
}));

vi.mock('../../meta/dev.js', () => ({
  runDev
}));

const command = new CommandRunner({
  entry: '../libnest-dev.js',
  root: import.meta.dirname
});

describe('libnest-dev', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should output help', async () => {
    const result = await command.run(['--help']);
    expect(result.error?.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage: libnest-dev');
  });

  it('should override the exit callback', async () => {
    const exitOverride = vi.spyOn(Command.prototype, 'exitOverride');
    const result = await command.run(['--help'], {
      ppid: 100
    });
    // // this is called twice: once when the module is loaded in the test helper, then again when the file is imported
    expect(exitOverride).toHaveBeenCalledTimes(2);
    expect(exitOverride).toHaveBeenLastCalledWith(expect.any(Function));
    expect(result.mocks.process.kill).toHaveBeenLastCalledWith(100);
    expect(result.mocks.process.exit).toHaveBeenLastCalledWith(0);
  });

  it('should set the action', async () => {
    const action = vi.spyOn(Command.prototype, 'action');
    await command.run(['--help']);
    const callback = action.mock.lastCall![0];
    expect(callback).toBeTypeOf('function');
  });

  it('should throw an error if LIBNEST_CONFIG_FILEPATH is not defined', async () => {
    const action = vi.spyOn(Command.prototype, 'action');
    const programError = vi.spyOn(Command.prototype, 'error');
    const result = await command.run([]);
    expect(action).toHaveBeenCalledOnce();
    expect(programError).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("environment variable 'LIBNEST_CONFIG_FILEPATH' must be defined")
    );
    expect(result.error?.exitCode).toBe(1);
  });

  it('should call the runDev function', async () => {
    const action = vi.spyOn(Command.prototype, 'action');
    const mapErr = vi.fn();
    runDev.mockReturnValueOnce({ mapErr });

    const result = await command.run([], {
      env: {
        LIBNEST_CONFIG_FILEPATH: '/path/to/config.js'
      }
    });
    expect(action).toHaveBeenCalledOnce();
    expect(result.error).toBe(null);
  });
});
