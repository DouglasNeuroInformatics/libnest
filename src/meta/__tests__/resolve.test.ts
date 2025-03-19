import * as path from 'node:path';

import type { RuntimeException } from '@douglasneuroinformatics/libjs';
import type { Err } from 'neverthrow';
import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { resolveAbsoluteImportPath, resolveUserConfig } from '../resolve.js';

const fs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  lstatSync: vi.fn(),
  readdirSync: vi.fn()
})) satisfies { [K in keyof typeof import('node:fs')]?: Mock };

vi.mock('node:fs', () => fs);

describe('resolveAbsoluteImportPath', () => {
  it('should return an error if the path does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false);
    expect(resolveAbsoluteImportPath('src/main.ts', '/root')).toMatchObject({
      error: {
        message: expect.stringContaining('File does not exist')
      }
    });
  });
  it('should return an error if the path exists, but is not a file', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => false } as any);
    expect(resolveAbsoluteImportPath('src/main.ts', '/root')).toMatchObject({
      error: {
        message: expect.stringContaining('Not a file')
      }
    });
  });
  it('should return an error if the file has an invalid extension', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
    expect(resolveAbsoluteImportPath('src/main.txt', '/root')).toMatchObject({
      error: {
        message: expect.stringContaining("Unexpected file extension '.txt'")
      }
    });
  });
  it('should return an absolute path when the file exists, relative to the working directory, and has a valid extension', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
    expect(resolveAbsoluteImportPath('src/main.ts', '/root')).toMatchObject({
      value: '/root/src/main.ts'
    });
  });
  it('should return an absolute path when the file exists and has a valid extension', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(true);
    vi.spyOn(fs, 'lstatSync').mockReturnValueOnce({ isFile: () => true } as any);
    expect(resolveAbsoluteImportPath('/root/src/main.ts', '/root')).toMatchObject({
      value: '/root/src/main.ts'
    });
  });
});

describe('resolveUserConfig', () => {
  it('should return an error if it cannot find the config file', () => {
    fs.readdirSync.mockReturnValue([]);
    const result = resolveUserConfig(import.meta.dirname) as Err<never, typeof RuntimeException.Instance>;
    expect(result.isErr()).toBe(true);
    expect(result.error.message).toBe('Failed to find libnest config file');
    const searched = result.error.details!.searched as string[];
    expect(searched.at(0)).toBe(import.meta.dirname);
    expect(searched.at(-1)).toBe('/');
    fs.readdirSync.mockClear();
  });

  it('should find a result with the config file if it can be found', () => {
    fs.readdirSync.mockReturnValueOnce([]).mockReturnValueOnce(['libnest.config.js']);
    const result = resolveUserConfig(import.meta.dirname);
    const expectedValue = path.resolve(path.dirname(import.meta.dirname), 'libnest.config.js');
    expect(result.isOk() && result.value === expectedValue).toBe(true);
  });
});
