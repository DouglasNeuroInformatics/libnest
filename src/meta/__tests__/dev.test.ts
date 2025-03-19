import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { ok, okAsync } from 'neverthrow';
import { describe, expect, it, vi } from 'vitest';

import { runDev } from '../dev.js';

import type { UserConfigOptions } from '../../user-config.js';

const dummyFilepath = './libnest.config.ts';

const { loadAppContainer, loadUserConfig, resolveAbsoluteImportPath } = vi.hoisted(() => ({
  loadAppContainer: vi.fn(),
  loadUserConfig: vi.fn(),
  resolveAbsoluteImportPath: vi.fn()
}));

vi.mock('../load.js', () => ({ loadAppContainer, loadUserConfig }));
vi.mock('../resolve.js', () => ({ resolveAbsoluteImportPath }));
vi.spyOn(process, 'cwd').mockReturnValue('/app');

describe('runDev', () => {
  it('should attempt to resolve the config file from the current working directory and return an error if it cannot be resolved', async () => {
    resolveAbsoluteImportPath.mockReturnValueOnce(RuntimeException.asErr('Failed to resolve path'));
    const result = await runDev(dummyFilepath);
    expect(resolveAbsoluteImportPath).toHaveBeenCalledExactlyOnceWith(dummyFilepath, '/app');
    expect(result).toMatchObject({
      error: {
        message: 'Failed to resolve path'
      }
    });
  });

  it('should call the bootstrap function on the app container and allow accessing global variables', async () => {
    const bootstrap = vi.fn(() => {
      // @ts-expect-error - this is defined in the config
      if (typeof __TEST__ === 'undefined') {
        throw new Error("Expected global variable '__TEST__' to be defined");
      }
    });
    const entry = vi.fn();
    const resolvedConfigPath = '/app/libnest.config.ts';
    const mockUserConfig = {
      entry,
      globals: {
        __TEST__: true
      }
    } satisfies Partial<UserConfigOptions>;
    resolveAbsoluteImportPath.mockReturnValueOnce(ok(resolvedConfigPath));
    loadUserConfig.mockReturnValueOnce(okAsync(mockUserConfig));
    loadAppContainer.mockReturnValueOnce(okAsync({ bootstrap }));
    const result = await runDev(dummyFilepath);
    expect(result.isOk());
    expect(loadUserConfig).toHaveBeenLastCalledWith(resolvedConfigPath);
    expect(loadAppContainer).toHaveBeenLastCalledWith(mockUserConfig);
  });
});
