import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';

import { createExec, process } from '../../testing/helpers/cli.js';

const exec = createExec({
  entry: '../libnest-build.js',
  root: import.meta.dirname
});

describe('libnest-build', () => {
  it('should output help', async () => {
    const parseAsync = vi.spyOn(Command.prototype, 'parseAsync');
    const result = await exec(['--help']);
    expect(parseAsync).toHaveBeenCalledExactlyOnceWith(['node', '../libnest-build.js', '--help']);
    expect(result).toMatchObject({ exitCode: 0 });
    expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('Usage: libnest-build'));
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
});
