import type { RuntimeException } from '@douglasneuroinformatics/libjs';
import type { ResultAsync } from 'neverthrow';

import { loadAppContainer, loadUserConfig } from './load.js';
import { resolveAbsoluteImportPath } from './resolve.js';

import type { NodeEnv } from '../schemas/env.schema.js';

/**
 * Runs the dev server using the app container from a config file.
 * @param configFile - The path to the config file.
 * @returns A `ResultAsync` containing void on success, or an error message on failure.
 */
export function runDev(configFile: string): ResultAsync<void, typeof RuntimeException.Instance> {
  process.env.NODE_ENV = 'development' satisfies NodeEnv;
  return resolveAbsoluteImportPath(configFile, process.cwd())
    .asyncAndThen(loadUserConfig)
    .andThen((config) => {
      return loadAppContainer(config).map(async (appContainer) => {
        if (config.globals) {
          Object.entries(config.globals).forEach(([key, value]) => {
            Object.defineProperty(globalThis, key, {
              value,
              writable: false
            });
          });
        }
        await appContainer.bootstrap();
      });
    });
}
