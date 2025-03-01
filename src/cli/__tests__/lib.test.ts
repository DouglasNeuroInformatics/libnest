import * as path from 'path';

import { ValueException } from '@douglasneuroinformatics/libjs';
import { err, ok } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { AppContainer } from '../../core/app/app.container.js';
import { importDefault, loadAppContainer, loadConfig, resolveAbsoluteImportPath, runDev } from '../lib.js';

import type { ConfigOptions } from '../../config/index.js';

const configFile = 'libnest.config.ts';
const entryFile = 'src/main.ts';
const rootDir = '/root';
const resolvedConfigFile = path.join(rootDir, configFile);
// const resolvedEntryFile = path.join(rootDir, entryFile);

const fs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  lstatSync: vi.fn()
})) satisfies { [K in keyof typeof import('node:fs')]?: Mock };

vi.mock('node:fs', () => fs);

beforeEach(() => {
  vi.spyOn(process, 'cwd').mockReturnValue(rootDir);
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('resolveAbsoluteImportPath', () => {
  it('should return an error if the path does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    expect(resolveAbsoluteImportPath('src/main.ts')).toMatchObject({
      error: {
        message: expect.stringContaining('File does not exist')
      }
    });
  });
  it('should return an error if the path exists, but is not a file', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => false } as any);
    expect(resolveAbsoluteImportPath('src/main.ts')).toMatchObject({
      error: {
        message: expect.stringContaining('Not a file')
      }
    });
  });
  it('should return an error if the file has an invalid extension', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
    expect(resolveAbsoluteImportPath('src/main.txt')).toMatchObject({
      error: {
        message: expect.stringContaining("Unexpected file extension '.txt'")
      }
    });
  });

  it('should return an absolute path when the file exists, relative to the working directory, and has a valid extension', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
    expect(resolveAbsoluteImportPath('src/main.ts')).toMatchObject({
      value: '/root/src/main.ts'
    });
  });
  it('should return an absolute path when the file exists and has a valid extension', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
    expect(resolveAbsoluteImportPath('/root/src/main.ts')).toMatchObject({
      value: '/root/src/main.ts'
    });
  });
});

describe('importDefault', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
  });

  it('should return an error if the module does not exist', async () => {
    const filepath = '/dev/null/foo.js';
    const result = await importDefault(filepath);
    expect(result.isErr() && result.error.message === `Failed to import module: ${filepath}`).toBe(true);
  });

  it('should return an error if called with a function that throws', async () => {
    const filepath = '/dev/null/foo.js';
    const result = await importDefault(() => import(filepath));
    const expectedMessage = `Failed to import module: module inferred as return value from function 'anonymous'`;
    expect(result.isErr() && result.error.message === expectedMessage).toBe(true);
  });

  it('should fail to import a module that does not have a default export', async () => {
    vi.doMock(entryFile, () => ({ default: undefined }));
    await expect(importDefault(entryFile)).resolves.toMatchObject({
      error: {
        message: `Missing required default export in module: ${entryFile}`
      }
    });
  });

  it('should return the default export, if there are no errors', async () => {
    vi.doMock(entryFile, () => ({ default: { url: 'https://opendatacapture.org' } }));
    await expect(importDefault(entryFile)).resolves.toMatchObject({
      value: {
        url: 'https://opendatacapture.org'
      }
    });
  });
});

describe('loadConfig', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
  });

  it('should return an error if importing the config file fails', async () => {
    vi.doMock(resolvedConfigFile, () => ({ default: 0 }));
    await expect(loadConfig(configFile)).resolves.toMatchObject({
      error: {
        message: `Invalid format for default export in config file: ${configFile}`
      }
    });
  });
});

describe('loadAppContainer', () => {
  it('should return an error if the entry function throws', async () => {
    const filepath = '/dev/null/foo.js';
    const result = await loadAppContainer({ entry: () => import(filepath) });
    expect(result.isErr() && result.error.message).toBe('Entry function in config failed to resolve');
  });

  it('should return an error if the entry does not result a result', async () => {
    const result = await loadAppContainer({ entry: () => Promise.resolve({ default: {} }) });
    expect(result).toMatchObject({
      error: {
        message: `Invalid default export from entry module: not a result`
      }
    });
  });

  it('should return an error if the entry module resolves to a known Error', async () => {
    const result = await loadAppContainer({
      entry: () => Promise.resolve({ default: ValueException.asErr('Invalid value') })
    });
    expect(result).toMatchObject({
      error: {
        message: `Failed to initialize application`
      }
    });
  });

  it('should return an error if the entry module resolves to an unknown exception', async () => {
    const result = await loadAppContainer({ entry: () => Promise.resolve({ default: err(new Error('An error')) }) });
    expect(result).toMatchObject({
      error: {
        message: 'Failed to initialize app due to a unexpected error'
      }
    });
  });

  it('should return an error if the entry file result is not an app container', async () => {
    const result = await loadAppContainer({ entry: () => Promise.resolve({ default: ok({}) }) });
    expect(result).toMatchObject({
      error: {
        message: 'Failed to initialize app: result from entry module does not contain valid AppContainer'
      }
    });
  });
});

describe('runDev', () => {
  let bootstrap: Mock;

  beforeEach(() => {
    bootstrap = vi.fn();
    vi.doMock(resolvedConfigFile, () => ({
      default: {
        entry: () => {
          return Promise.resolve({
            default: ok(
              Object.create(AppContainer.prototype, {
                bootstrap: {
                  value: bootstrap
                }
              })
            )
          });
        },
        globals: {
          __TEST__: true
        }
      } satisfies ConfigOptions
    }));
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
  });

  it('should call the bootstrap function on the app container and allow accessing global variables', async () => {
    bootstrap.mockImplementationOnce(() => {
      // @ts-expect-error - this is defined in the config
      if (typeof __TEST__ === 'undefined') {
        throw new Error("Expected global variable '__TEST__' to be defined");
      }
    });
    const result = await runDev(configFile);
    expect(result.isOk()).toBe(true);
    expect(bootstrap).toHaveBeenCalledOnce();
  });

  it('should set the NODE_ENV to development, unless it has been explicitly set to something else', async () => {
    vi.stubEnv('NODE_ENV', undefined);
    const result = await runDev(configFile);
    expect(result.isOk()).toBe(true);
    expect(process.env.NODE_ENV).toBe('development');
    vi.unstubAllEnvs();
  });
});
