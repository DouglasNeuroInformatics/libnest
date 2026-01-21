import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { Command } from 'commander';
import { ok } from 'neverthrow';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CommandRunner } from '../../testing/helpers/cli.js';

const { buildProd, register } = vi.hoisted(() => ({
  buildProd: vi.fn(),
  register: vi.fn()
}));

vi.mock('node:module', () => ({
  register
}));

vi.mock('../../meta/build.js', () => ({
  buildProd
}));

const command = new CommandRunner({
  entry: '../libnest-build.js',
  root: import.meta.dirname
});

describe('libnest-build', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should output help', async () => {
    const parseAsync = vi.spyOn(Command.prototype, 'parseAsync');
    const result = await command.run(['--help']);
    expect(result.error?.exitCode).toBe(0);
    expect(parseAsync).toHaveBeenCalledExactlyOnceWith(['node', '../libnest-build.js', '--help']);
    expect(result.stdout).toContain('Usage: libnest-build');
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
    expect(action).toHaveBeenCalled();
    expect(programError).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("environment variable 'LIBNEST_CONFIG_FILEPATH' must be defined")
    );
    expect(result.error?.exitCode).toBe(1);
  });

  it('should call the buildProd function', async () => {
    const action = vi.spyOn(Command.prototype, 'action');
    const programError = vi.spyOn(Command.prototype, 'error');

    buildProd.mockReturnValueOnce(ok());

    const result = await command.run([], {
      env: {
        LIBNEST_CONFIG_FILEPATH: '/path/to/config.js'
      }
    });

    expect(action).toHaveBeenCalledOnce();
    expect(result.error).toBe(null);
    expect(programError).not.toHaveBeenCalled();
  });

  it('should handle errors correctly', async () => {
    const action = vi.spyOn(Command.prototype, 'action');
    const programError = vi.spyOn(Command.prototype, 'error');
    buildProd.mockReturnValueOnce(RuntimeException.asErr('Something Went Wrong'));

    const result = await command.run([], {
      env: {
        LIBNEST_CONFIG_FILEPATH: '/path/to/config.js'
      }
    });

    expect(action).toHaveBeenCalledOnce();
    expect(result.error).toBeInstanceOf(Error);
    expect(programError).toHaveBeenCalledOnce();
  });
});
