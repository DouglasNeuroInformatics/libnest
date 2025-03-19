import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { ok, okAsync } from 'neverthrow';
import { describe, expect, it, vi } from 'vitest';

import { loadAppContainer, loadUserConfig } from '../load.js';

const dummyFilepath = '/root/src/app.js';

const { importDefault, parseEntryFromFunction } = vi.hoisted(() => ({
  importDefault: vi.fn(),
  parseEntryFromFunction: vi.fn()
}));

vi.mock('../import.js', () => ({ importDefault }));
vi.mock('../parse.js', () => ({ parseEntryFromFunction }));

describe('loadUserConfig', () => {
  it('should return an error if importing the config file fails', async () => {
    importDefault.mockReturnValueOnce(RuntimeException.asAsyncErr('Import failed'));
    const result = await loadUserConfig(dummyFilepath);
    expect(importDefault).toHaveBeenCalledExactlyOnceWith(dummyFilepath);
    expect(result).toMatchObject({
      error: {
        message: 'Import failed'
      }
    });
  });
  it('should return an error if the config file does not match the expected schema', async () => {
    importDefault.mockReturnValueOnce(okAsync({}));
    const result = await loadUserConfig(dummyFilepath);
    expect(result).toMatchObject({
      error: {
        details: {
          issues: expect.any(Array)
        },
        message: `Invalid format for user options in config file: ${dummyFilepath}`
      }
    });
  });
  it('should successful parse the example config', async () => {
    const { default: userConfig } = await import('../../../libnest.config.js');
    importDefault.mockReturnValueOnce(okAsync(userConfig));
    const result = await loadUserConfig(dummyFilepath);
    expect(result.isOk()).toBe(true);
  });
});

describe('loadAppContainer', () => {
  it('should return an error if the config entry cannot be parsed', async () => {
    parseEntryFromFunction.mockReturnValueOnce(RuntimeException.asErr('Failed to parse function'));
    const result = await loadAppContainer({
      baseDir: '/root',
      entry: () => Promise.resolve({})
    });
    expect(result).toMatchObject({
      error: {
        message: 'Failed to parse function'
      }
    });
  });

  it('should return an error if the entry does not return an AppContainer', async () => {
    parseEntryFromFunction.mockReturnValue(ok(dummyFilepath));
    importDefault.mockReturnValueOnce(okAsync({}));
    const result = await loadAppContainer({ baseDir: '/', entry: () => Promise.resolve({ default: {} }) });
    expect(result).toMatchObject({
      error: {
        message: 'Default export from entry module is not an AppContainer'
      }
    });
  });

  it('should successfully load the example app container', async () => {
    const { default: appContainer } = await import('../../../example/app.js');
    parseEntryFromFunction.mockReturnValue(ok(dummyFilepath));
    importDefault.mockReturnValueOnce(okAsync(appContainer));
    const result = await loadAppContainer({ baseDir: '/', entry: () => Promise.resolve({ default: {} }) });
    expect(result.isOk()).toBe(true);
  });
});
