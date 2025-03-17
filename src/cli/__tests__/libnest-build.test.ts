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
});
