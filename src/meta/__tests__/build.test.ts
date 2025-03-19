import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ok, okAsync } from 'neverthrow';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { buildProd, bundle } from '../build.js';

import type { AppContainer } from '../../app/app.container.js';
import type { UserConfigOptions } from '../../user-config.js';

const { loadUserConfig, parseEntryFromFunction } = vi.hoisted(() => ({
  loadUserConfig: vi.fn(),
  parseEntryFromFunction: vi.fn()
}));

vi.mock('../load.js', () => ({ loadUserConfig }));
vi.mock('../parse.js', () => ({ parseEntryFromFunction }));

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

describe('buildProd', () => {
  let outdir: string;

  const configFile = path.resolve(import.meta.dirname, '../../../libnest.config.js');

  beforeAll(async () => {
    outdir = await fs.promises.mkdtemp(os.tmpdir());
  });

  afterAll(async () => {
    await fs.promises.rm(outdir, { force: true, recursive: true });
  });

  it('should correctly bundle the example application ', { timeout: 10000 }, async () => {
    const outfile = path.join(outdir, 'server.js');
    loadUserConfig.mockReturnValue(
      okAsync({
        build: {
          mode: 'module',
          outfile
        },
        entry: vi.fn()
      } satisfies UserConfigOptions)
    );
    parseEntryFromFunction.mockReturnValueOnce(ok('./example/app.js'));
    const result = await buildProd({ configFile });
    expect(result.isOk()).toBe(true);
    expect(fs.existsSync(outfile)).toBe(true);
  });

  it('should correctly bundle the example application as a module', { timeout: 10000 }, async () => {
    const outfile = path.join(outdir, 'module.js');
    loadUserConfig.mockReturnValue(
      okAsync({
        build: {
          mode: 'module',
          outfile
        },
        entry: vi.fn(),
        globals: {
          __RELEASE__: {
            version: 'latest'
          }
        }
      } satisfies UserConfigOptions)
    );
    parseEntryFromFunction.mockReturnValueOnce(ok('./example/app.js'));
    const result = await buildProd({ configFile });
    expect(result.isOk()).toBe(true);
    const appContainer = await import(outfile).then((module) => module.default as AppContainer);
    const app = appContainer.getApplicationInstance();
    expect(app).toBeDefined();
  });
});
