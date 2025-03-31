import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { ok, okAsync } from 'neverthrow';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { buildProd } from '../build.js';

import type { UserConfigOptions } from '../../user-config.js';

const { loadUserConfig, parseEntryFromFunction } = vi.hoisted(() => ({
  loadUserConfig: vi.fn(),
  parseEntryFromFunction: vi.fn()
}));

const esbuildMock = {
  build: vi.fn()
};

vi.mock('../load.js', () => ({ loadUserConfig }));
vi.mock('../parse.js', () => ({ parseEntryFromFunction }));

describe('buildProd', () => {
  let outdir: string;

  const configFile = path.resolve(import.meta.dirname, '../../../libnest.config.js');

  beforeAll(async () => {
    outdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), '-foo'));
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        fs.rm(outdir, { force: true, recursive: true }, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      }, 500);
    });
  });

  it('should return an error if esbuild throws', async () => {
    vi.doMock('esbuild', () => esbuildMock);
    const cause = new Error('Something went wrong');
    esbuildMock.build.mockImplementationOnce(() => {
      throw cause;
    });
    const outfile = path.join(outdir, 'server.js');
    loadUserConfig.mockReturnValue(
      okAsync({
        build: {
          mode: 'server',
          outfile
        },
        entry: vi.fn()
      } satisfies UserConfigOptions)
    );
    parseEntryFromFunction.mockReturnValueOnce(ok('./example/app.js'));
    await expect(buildProd({ configFile })).resolves.toMatchObject({
      error: {
        cause,
        message: 'Failed to build application'
      }
    });
    vi.doUnmock('esbuild');
  });

  it('should correctly bundle the example application ', { timeout: 10000 }, async () => {
    const outfile = path.join(outdir, 'server.js');
    loadUserConfig.mockReturnValue(
      okAsync({
        build: {
          mode: 'server',
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
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const outfile = path.join(outdir, 'module.js');
    const onComplete = vi.fn();
    loadUserConfig.mockReturnValue(
      okAsync({
        build: {
          mode: 'module',
          onComplete,
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
    const result = await buildProd({ configFile, verbose: true });
    expect(result.isOk()).toBe(true);
    const appContainer = await import(outfile).then((module) => module.default);
    // Cannot check instanceof because prototype is different in bundle
    expect(appContainer.constructor.name).toBe('AppContainer');
    expect(onComplete).toHaveBeenCalledOnce();
    expect(consoleLog).toHaveBeenCalled();
    expect(consoleLog).toHaveBeenLastCalledWith('Done!');
  });

  it('should handle errors in the onComplete callback', async () => {
    vi.doMock('esbuild', () => esbuildMock);
    const callbackError = new Error('Something went wrong');
    const onComplete = vi.fn().mockImplementation(() => {
      throw callbackError;
    });
    loadUserConfig.mockReturnValue(
      okAsync({
        build: {
          mode: 'module',
          onComplete,
          outfile: '/dev/null'
        },
        entry: vi.fn()
      } satisfies UserConfigOptions)
    );
    parseEntryFromFunction.mockReturnValueOnce(ok('./example/app.js'));
    const result = await buildProd({ configFile });
    expect(result.isErr()).toBe(true);
    expect(result).toMatchObject({
      error: {
        cause: callbackError,
        message: 'An error occurred in the user-specified `onComplete` callback'
      }
    });
    expect(onComplete).toHaveBeenCalledOnce();
    vi.doUnmock('esbuild');
  });
});
