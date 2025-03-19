import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { bundle } from '../build.js';

describe('bundle', () => {
  const esbuild = {
    build: vi.fn()
  };

  beforeAll(() => {
    vi.doMock('esbuild', () => esbuild);
  });

  afterAll(() => {
    vi.doUnmock('esbuild');
  });

  it('should return an error if esbuild throws', async () => {
    const cause = new Error('Something went wrong');
    esbuild.build.mockImplementationOnce(() => {
      throw cause;
    });
    await expect(
      bundle({ config: { build: { outfile: 'out.js' } }, entrySpecifier: './app.ts', resolveDir: '/' })
    ).resolves.toMatchObject({
      error: {
        cause,
        message: 'Failed to build application'
      }
    });
  });
  it('should an ok result on success', async () => {
    esbuild.build.mockResolvedValueOnce({});
    const result = await bundle({
      config: { build: { outfile: 'out.js' } },
      entrySpecifier: './app.ts',
      resolveDir: '/'
    });
    expect(result.isOk()).toBe(true);
  });
});
