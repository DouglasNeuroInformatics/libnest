import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { fromAsyncThrowable, ok } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { AbstractAppContainer } from '../app/app.base.js';
import { importDefault } from './import.js';
import { parseEntryFromFunction } from './parse.js';

import type { UserConfigOptions } from '../user-config.js';

// we cannot use zod function here as we cannot have any wrappers apply and screw up toString representation
const $EntryFunction = z.custom<(...args: any[]) => any>((arg) => typeof arg === 'function');

const $UserConfigOptions: z.ZodType<UserConfigOptions> = z.object({
  build: z.object({
    esbuildOptions: z.record(z.any()).optional(),
    mode: z.enum(['module', 'server']).optional(),
    onComplete: z.function().returns(z.any()).optional(),
    outfile: z.string().min(1)
  }),
  entry: $EntryFunction,
  globals: z.record(z.any()).optional()
});

type UserConfigWithBaseDir = UserConfigOptions & {
  baseDir: string;
};

/**
 * Load the user config options
 * @param configFile - The path to the config file.
 * @returns A `ResultAsync` containing the config options on success, or an error message on failure.
 */
export function loadUserConfig(
  configFile: string,
  loader: (configFile: string) => ResultAsync<unknown, typeof RuntimeException.Instance> = importDefault
): ResultAsync<UserConfigWithBaseDir, typeof RuntimeException.Instance> {
  return loader(configFile).andThen((config) => {
    const result = $UserConfigOptions.safeParse(config);
    if (!result.success) {
      return RuntimeException.asAsyncErr(`Invalid format for user options in config file: ${configFile}`, {
        details: {
          issues: result.error.issues
        }
      });
    }
    return ok({ ...result.data, baseDir: path.dirname(configFile) });
  });
}

export const loadEntry = fromAsyncThrowable(
  (entry: (...args: any[]) => Promise<{ [key: string]: unknown }>) => {
    return entry().then((exports) => exports.default);
  },
  (err) => {
    return new RuntimeException('Entry function throw an unexpected error', {
      cause: err
    });
  }
);

/**
 * Load the app container from a user config
 * @param config - The user config
 * @returns A `ResultAsync` containing the app container on success, or an error message on failure.
 */
export function loadAppContainer(
  config: Pick<UserConfigWithBaseDir, 'baseDir' | 'entry'>
): ResultAsync<AbstractAppContainer, typeof RuntimeException.Instance> {
  return parseEntryFromFunction(config.entry)
    .map((importPath) => path.join(config.baseDir, importPath))
    .asyncAndThen(importDefault)
    .map(async (defaultExport) => {
      const appContainer = await defaultExport;
      return appContainer;
    })
    .andThen((appContainer) => {
      if (!(appContainer instanceof AbstractAppContainer)) {
        return RuntimeException.asAsyncErr('Default export from entry module is not an AppContainer');
      }
      return ok(appContainer as AbstractAppContainer);
    });
}

export type { UserConfigWithBaseDir };
