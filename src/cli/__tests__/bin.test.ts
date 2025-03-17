import { describe, expect, it, test } from 'vitest';

import { setupCommandTest } from '../../testing/helpers/cli.js';

const { cmd, exec } = setupCommandTest({
  entry: '../bin.js',
  root: import.meta.dirname
});

test(() => {
  expect(true).toBe(true);
});

describe('libnest', () => {
  it('should output help', async () => {
    const result = await exec(['--help']);
    expect(result).toMatchObject({ exitCode: 0 });
    expect(cmd.stdout).toHaveBeenCalledWith(expect.stringContaining('Usage: @douglasneuroinformatics/libnest'));
  });
});
