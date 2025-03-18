import * as os from 'node:os';
import * as path from 'path';

import type { Err } from 'neverthrow';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { build, bundle, parseEntryFromFunction, swcPlugin } from '../build.utils.js';

const fs = vi.hoisted(() => ({
  readFile: vi.fn()
})) satisfies { [K in keyof typeof import('node:fs/promises')]?: Mock };

vi.mock('node:fs/promises', () => fs);

describe('parseEntryFromFunction', () => {
  it('should return an error if there are no imports in the entry function', () => {
    expect(parseEntryFromFunction(() => Promise.resolve({}))).toMatchObject({
      error: {
        message: `Entry function must include exactly one import: found 0`
      }
    });
  });
  it('should return an error if the import expression is not a dynamic import', () => {
    const entry = { toString: () => "() => import.meta.resolve('./app.js')" } as any;
    expect(parseEntryFromFunction(entry)).toMatchObject({
      error: {
        message: 'Entry function must contain dynamic import: found ImportMeta'
      }
    });
  });
  it('should return an error if the dynamic import expression is not a string literal', () => {
    const entry = { toString: () => "() => import(`${'./' + 'ab.js'}`)" } as any;
    expect(parseEntryFromFunction(entry)).toMatchObject({
      error: {
        message: 'Dynamic import in entry function must import a string literal'
      }
    });
  });
  it('should return the result with the specifier', () => {
    const entry = { toString: () => "() => import('./app.js')" } as any;
    expect(parseEntryFromFunction(entry)).toMatchObject({
      value: './app.js'
    });
  });
});

describe('swcPlugin', () => {
  const swc = {
    transform: vi.fn()
  };

  beforeAll(() => {
    vi.doMock('@swc/core', () => swc);
  });

  afterAll(() => {
    vi.doUnmock('@swc/core');
  });

  it('should transform TypeScript code using SWC', async () => {
    const mockTsCode = `const x: number = 42;`;
    const mockTransformedCode = `const x = 42;`;
    fs.readFile.mockResolvedValueOnce(mockTsCode);
    swc.transform.mockResolvedValue({ code: mockTransformedCode });

    const plugin = swcPlugin();

    const buildMock = {
      onLoad: vi.fn((_options, callback) => {
        callback({ path: 'test.ts' }).then((result: any) => {
          expect(fs.readFile).toHaveBeenCalledWith('test.ts', 'utf-8');
          expect(swc.transform).toHaveBeenCalledWith(mockTsCode, expect.any(Object));
          expect(result).toEqual({ contents: mockTransformedCode, loader: 'js' });
        });
      })
    };
    await plugin.setup(buildMock as any);
    expect(buildMock.onLoad).toHaveBeenCalledWith({ filter: /\.(ts)$/ }, expect.any(Function));
  });
});

describe('build', () => {
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
    await expect(build({ entrySpecifier: './app.ts', outfile: 'out.js', resolveDir: '/' })).resolves.toMatchObject({
      error: {
        cause,
        message: 'Failed to build application'
      }
    });
  });
  it('should an ok result on success', async () => {
    esbuild.build.mockResolvedValueOnce({});
    const result = await build({ entrySpecifier: './app.ts', outfile: 'out.js', resolveDir: '/' });
    expect(result.isOk()).toBe(true);
  });
});

describe('bundle', () => {
  let fsActual: typeof import('node:fs');
  let outdir: string;

  beforeAll(async () => {
    fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');
    outdir = await fsActual.promises.mkdtemp(os.tmpdir());
    fs.readFile.mockImplementation(fsActual.promises.readFile);
  });

  afterAll(async () => {
    await fsActual.promises.rm(outdir, { force: true, recursive: true });
  });

  it('should return an error if the default export from the config file is not a plain object', async () => {
    vi.doMock('/foo.js', () => ({ default: '' }));
    const result = (await bundle({ configFile: '/foo.js', outfile: '/dev/null' })) as Err<never, any>;
    expect(result.isErr()).toBe(true);
    expect(result.error.message.includes('Invalid format for default export in config file')).toBe(true);
  });

  it('should correctly bundle the example application', { timeout: 10000 }, async () => {
    const configFile = path.resolve(import.meta.dirname, '../../../libnest.config.js');
    const entryFile = './example/app.js';
    const entry = () => ({});
    entry.toString = () => `() => import('${entryFile}')`;
    vi.doMock(configFile, () => ({
      default: {
        entry
      }
    }));
    const outfile = path.join(outdir, 'server.js');
    const result = await bundle({ configFile, outfile });
    expect(result.isOk()).toBe(true);
    expect(fsActual.existsSync(outfile)).toBe(true);
  });
});
