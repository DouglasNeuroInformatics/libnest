// import { describe, expect, it } from 'vitest';

import { describe, expect, it } from 'vitest';

import { setupCommandTest } from '../../testing/helpers/cli.js';

const { exec, process } = setupCommandTest({
  entry: '../libnest-dev.js',
  root: import.meta.dirname
});

describe('libnest dev', () => {
  it('should output help', async () => {
    const result = await exec(['--help']);
    expect(result).toMatchObject({ exitCode: 0 });
    expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('Usage: libnest-dev'));
  });
});
