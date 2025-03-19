import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { ok } from 'neverthrow';
import type { ResultAsync } from 'neverthrow';
import { z } from 'zod';

import { importDefault } from './import.js';

import type { UserConfigOptions } from '../user-config.js';

// we cannot use zod function here as we cannot have any wrappers apply and screw up toString representation
const $EntryFunction = z.custom<(...args: any[]) => any>((arg) => typeof arg === 'function');

export const $UserConfigOptions: z.ZodType<UserConfigOptions> = z.object({
  build: z.object({
    esbuildOptions: z.record(z.any()).optional(),
    mode: z.enum(['module', 'server']).optional(),
    outfile: z.string().min(1)
  }),
  entry: $EntryFunction,
  globals: z.record(z.any()).optional()
});

/**
 * Load the user config options
 * @param configFile - The path to the config file.
 * @returns A `ResultAsync` containing the config options on success, or an error message on failure.
 */
export function loadUserConfig(configFile: string): ResultAsync<UserConfigOptions, typeof RuntimeException.Instance> {
  return importDefault(configFile).andThen((config) => {
    const result = $UserConfigOptions.safeParse(config);
    if (!result.success) {
      return RuntimeException.asAsyncErr(`Invalid format for user options in config file: ${configFile}`, {
        details: {
          issues: result.error.issues
        }
      });
    }
    return ok(result.data);
  });
}
