import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';

import { createExec, process } from '../../testing/helpers/cli.js';

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
});
