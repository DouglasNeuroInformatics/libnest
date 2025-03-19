import { describe, expect, it, vi } from 'vitest';

import { importDefault } from '../import.js';

const dummyFilepath = '/root/bar/foo.js';

describe('importDefault', () => {
  it('should return an error if the module does not exist', async () => {
    const result = await importDefault(dummyFilepath);
    expect(result.isErr() && result.error.message === `Failed to import module: ${dummyFilepath}`).toBe(true);
  });
  it('should fail to import a module that does not have a default export', async () => {
    vi.doMock(dummyFilepath, () => ({ default: undefined }));
    await expect(importDefault(dummyFilepath)).resolves.toMatchObject({
      error: {
        message: `Missing required default export in module: ${dummyFilepath}`
      }
    });
  });
  it('should return the default export, if there are no errors', async () => {
    vi.doMock(dummyFilepath, () => ({ default: { url: 'https://opendatacapture.org' } }));
    await expect(importDefault(dummyFilepath)).resolves.toMatchObject({
      value: {
        url: 'https://opendatacapture.org'
      }
    });
  });
});
