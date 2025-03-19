import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { okAsync } from 'neverthrow';
import { describe, expect, it, vi } from 'vitest';

import { loadUserConfig } from '../load.js';

const dummyFilepath = '/root/bar/foo.js';

const importDefault = vi.hoisted(() => vi.fn());

vi.mock('../import.js', () => ({ importDefault }));

describe('loadUserConfig', () => {
  it('should return an error if importing the config file fails', async () => {
    importDefault.mockReturnValueOnce(RuntimeException.asAsyncErr('Something went wrong'));
    const result = await loadUserConfig(dummyFilepath);
    expect(importDefault).toHaveBeenCalledExactlyOnceWith(dummyFilepath);
    expect(result).toMatchObject({
      error: {
        message: 'Something went wrong'
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
});
