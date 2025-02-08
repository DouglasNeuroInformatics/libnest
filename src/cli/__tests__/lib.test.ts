import * as path from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { z } from 'zod';

import { importDefault, resolveAbsoluteImportPath, resolveBootstrapFunction } from '../lib.js';

import type { ConfigOptions } from '../lib.js';

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
      error: expect.stringContaining('File does not exist')
    });
  });
  it('should return an error if the path exists, but is not a file', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => false } as any);
    expect(resolveAbsoluteImportPath('src/main.ts')).toMatchObject({
      error: expect.stringContaining('Not a file')
    });
  });
  it('should return an error if the file has an invalid extension', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
    expect(resolveAbsoluteImportPath('src/main.txt')).toMatchObject({
      error: expect.stringContaining("Unexpected file extension '.txt'")
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
  const schema = z.object({
    url: z
      .string()
      .url()
      .transform((arg) => new URL(arg))
  });

  beforeEach(() => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
  });

  it('should return an error if the module cannot be resolved', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    await expect(importDefault(entryFile, schema)).resolves.toMatchObject({
      error: `File does not exist: ${resolvedEntryFile}`
    });
  });

  it('should fail to import a module that does not exist', async () => {
    await expect(importDefault(entryFile, schema)).resolves.toMatchObject({
      error: `Failed to import module: ${resolvedEntryFile}`
    });
    expect(stderr).toHaveBeenCalledOnce();
  });

  it('should fail to import a module that does not have a default export', async () => {
    vi.doMock(resolvedEntryFile, () => ({ default: undefined }));
    await expect(importDefault(entryFile, schema)).resolves.toMatchObject({
      error: `Missing required default export in module: ${resolvedEntryFile}`
    });
  });

  it('should fail to import a module that has a default export, but which does not respect the schema', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(stderr);
    vi.doMock(resolvedEntryFile, () => ({ default: 0 }));
    await expect(importDefault(entryFile, schema)).resolves.toMatchObject({
      error: `Invalid default export in module: ${resolvedEntryFile}`
    });
    expect(stderr).toHaveBeenCalledWith([
      expect.objectContaining({
        code: 'invalid_type',
        expected: 'object',
        path: [],
        received: 'number'
      })
    ]);
  });

  it('should return the parsed default export, if there are no errors', async () => {
    vi.doMock(resolvedEntryFile, () => ({ default: { url: 'https://opendatacapture.org' } }));
    await expect(importDefault(entryFile, schema)).resolves.toMatchObject({
      value: {
        url: expect.any(URL)
      }
    });
  });
});

describe('resolveBootstrapFunction', () => {
  beforeEach(() => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValue({ isFile: () => true } as any);
  });

  it('should return an error if importing the config file fails', async () => {
    vi.doMock(resolvedConfigFile, () => ({ default: 0 }));
    await expect(resolveBootstrapFunction(configFile)).resolves.toMatchObject({
      error: `Invalid default export in module: ${resolvedConfigFile}`
    });
  });

  it('should return an error if the entry file cannot be imported', async () => {
    vi.doMock(resolvedConfigFile, () => ({
      default: {
        entry: entryFile
      } satisfies ConfigOptions
    }));
    vi.doMock(resolvedEntryFile, () => ({ default: 0 }));
    const result = await resolveBootstrapFunction(configFile);
    expect(result).toMatchObject({
      error: `Invalid default export in module: ${resolvedEntryFile}`
    });
  });

  it('should assign properties to the global object if specified', async () => {
    vi.doMock(resolvedConfigFile, () => ({
      default: {
        entry: entryFile,
        globals: {
          __TEST__: true
        }
      } satisfies ConfigOptions
    }));
    vi.doMock(resolvedEntryFile, () => ({ default: vi.fn() }));
    expect(Reflect.get(global, '__TEST__')).toBe(undefined);
    const result = await resolveBootstrapFunction(configFile);
    expect(Reflect.get(global, '__TEST__')).toBe(true);
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOr(null)).toBeTypeOf('function');
  });
});
