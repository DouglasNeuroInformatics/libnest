import { describe, expect, it } from 'vitest';

import { setupCommandTest } from '../../testing/helpers/cli.js';

const { exec, process } = setupCommandTest({
  entry: '../libnest.js',
  root: import.meta.dirname
});

describe('libnest', () => {
  it('should output help', async () => {
    const result = await exec(['--help']);
    expect(result).toMatchObject({ exitCode: 0 });
    expect(process.stdout.write).toHaveBeenCalledWith(
      expect.stringContaining('Usage: @douglasneuroinformatics/libnest')
    );
  });
});
