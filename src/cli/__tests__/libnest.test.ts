import { describe, expect, it } from 'vitest';

import { setupCommandTest } from '../../testing/helpers/cli.js';

const cmd = setupCommandTest({
  entry: '../libnest.js',
  root: import.meta.dirname
});

describe('libnest', () => {
  it('should output help', async () => {
    const result = await cmd.exec(['--help']);
    expect(result).toMatchObject({ exitCode: 0 });
    expect(cmd.stdout).toHaveBeenCalledWith(expect.stringContaining('Usage: @douglasneuroinformatics/libnest'));
  });
});
