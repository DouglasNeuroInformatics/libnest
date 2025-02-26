import * as path from 'path';

import { ValueException } from '@douglasneuroinformatics/libjs';
import { err, ok } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { AppContainer } from '../../core/app/app.container.js';
import { importDefault, importModule, loadConfig, resolveAbsoluteImportPath, runDev } from '../lib.js';

import type { ConfigOptions } from '../../config/index.js';

const configFile = 'libnest.config.ts';
const entryFile = 'src/main.ts';
const rootDir = '/root';
const resolvedConfigFile = path.join(rootDir, configFile);
const resolvedEntryFile = path.join(rootDir, entryFile);
const stderr: Mock<typeof console.error> = vi.fn();

const fs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  lstatSync: vi.fn()
})) satisfies { [K in keyof typeof import('node:fs')]?: Mock };

vi.mock('node:fs', () => fs);

beforeEach(() => {
  vi.spyOn(process, 'cwd').mockReturnValue(rootDir);
  vi.spyOn(console, 'error').mockImplementation(stderr);
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

describe('importModule', () => {
  it('should return an error if the module does not exist', async () => {
    const filepath = '/dev/null/foo.js';
    const result = await importModule(filepath);
    expect(result.isErr() && result.error.message === `Failed to import module: ${filepath}`).toBe(true);
  });
});

describe('importDefault', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
  });

  it('should return an error if the module cannot be resolved', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    await expect(importDefault(entryFile)).resolves.toMatchObject({
      error: {
        message: `File does not exist: ${resolvedEntryFile}`
      }
    });
  });

  it('should fail to import a module that does not exist', async () => {
    await expect(importDefault(entryFile)).resolves.toMatchObject({
      error: {
        message: `Failed to import module: ${resolvedEntryFile}`
      }
    });
  });

  it('should fail to import a module that does not have a default export', async () => {
    vi.doMock(resolvedEntryFile, () => ({ default: undefined }));
    await expect(importDefault(entryFile)).resolves.toMatchObject({
      error: {
        message: `Missing required default export in module: ${resolvedEntryFile}`
      }
    });
  });

  it('should return the parsed default export, if there are no errors', async () => {
    vi.doMock(resolvedEntryFile, () => ({ default: { url: 'https://opendatacapture.org' } }));
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

  it('should return an error if the entry file does not export a result', async () => {
    vi.doMock(resolvedConfigFile, () => ({
      default: {
        entry: entryFile
      } satisfies ConfigOptions
    }));
    vi.doMock(resolvedEntryFile, () => ({ default: 0 }));
    const result = await loadConfig(configFile);
    expect(result).toMatchObject({
      error: {
        message: `Invalid default export for entry file '${entryFile}': not a result`
      }
    });
  });

  it('should return an error if the entry file exports a known Error', async () => {
    vi.doMock(resolvedConfigFile, () => ({
      default: {
        entry: entryFile
      } satisfies ConfigOptions
    }));
    vi.doMock(resolvedEntryFile, () => ({ default: ValueException.asErr('Invalid value') }));
    const result = await loadConfig(configFile);
    expect(result).toMatchObject({
      error: {
        message: `Failed to initialize application`
      }
    });
  });
  it('should return an error if the entry file exports an unknown exception', async () => {
    vi.doMock(resolvedConfigFile, () => ({
      default: {
        entry: entryFile
      } satisfies ConfigOptions
    }));
    vi.doMock(resolvedEntryFile, () => ({ default: err(new Error('An error')) }));
    const result = await loadConfig(configFile);
    expect(result).toMatchObject({
      error: {
        message: 'Failed to initialize app due to a unexpected error'
      }
    });
  });
  it('should return an error if the entry file result is not an app container', async () => {
    vi.doMock(resolvedConfigFile, () => ({
      default: {
        entry: entryFile
      } satisfies ConfigOptions
    }));
    vi.doMock(resolvedEntryFile, () => ({ default: ok({}) }));
    const result = await loadConfig(configFile);
    expect(result).toMatchObject({
      error: {
        message: 'Failed to initialize app: exported result from entry file does not contain valid AppContainer'
      }
    });
  });
});

describe('runDev', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
  });

  it('should call the bootstrap function on the app container and allow accessing global variables', async () => {
    const appContainer: { bootstrap: Mock } = Object.create(AppContainer.prototype, {
      bootstrap: {
        value: vi.fn(() => {
          // @ts-expect-error - this is defined in the config
          if (typeof __TEST__ === 'undefined') {
            throw new Error("Expected global variable '__TEST__' to be defined");
          }
        })
      }
    });
    vi.doMock(resolvedConfigFile, () => ({
      default: {
        entry: entryFile,
        globals: {
          __TEST__: true
        }
      } satisfies ConfigOptions
    }));
    vi.doMock(resolvedEntryFile, () => ({ default: ok(appContainer) }));
    const result = await runDev(configFile);
    expect(result.isOk()).toBe(true);
    expect(appContainer.bootstrap).toHaveBeenCalledOnce();
  });
});
