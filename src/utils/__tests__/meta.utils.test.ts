import * as path from 'node:path';

import type { RuntimeException } from '@douglasneuroinformatics/libjs';
import type { Err } from 'neverthrow';
import { describe, expect, it, vi } from 'vitest';

import { findConfigFile } from '../meta.utils.js';

const readdirSync = vi.hoisted(() => vi.fn());

vi.mock('node:fs', () => ({ readdirSync }));

describe('findConfigFile', () => {
  it('should return an error if it cannot find the config file', () => {
    readdirSync.mockReturnValue([]);
    const result = findConfigFile(import.meta.dirname) as Err<never, typeof RuntimeException.Instance>;
    expect(result.isErr()).toBe(true);
    expect(result.error.message).toBe('Failed to find libnest config file');
    const searched = result.error.details!.searched as string[];
    expect(searched.at(0)).toBe(import.meta.dirname);
    expect(searched.at(-1)).toBe('/');
    readdirSync.mockClear();
  });

  it('should find a result with the config file if it can be found', () => {
    readdirSync.mockReturnValueOnce([]).mockReturnValueOnce(['libnest.config.js']);
    const result = findConfigFile(import.meta.dirname);
    const expectedValue = path.resolve(path.dirname(import.meta.dirname), 'libnest.config.js');
    expect(result.isOk() && result.value === expectedValue).toBe(true);
  });
});
