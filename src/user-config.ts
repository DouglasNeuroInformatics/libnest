import type { Promisable } from 'type-fest';
import type { z } from 'zod';

import type { AppContainer } from './app/app.container.js';

/**
 * Configuration options for a `libnest` application.
 */
export type UserConfigOptions = {
  /**
   * The entry point for the `libnest` CLI.
   *
   * This should be a module whose default export is a function that initializes the application.
   */
  entry: () => Promise<{ [key: string]: any }>;

  /**
   * Optional global variables that should be defined at runtime.
   */
  globals?: { [key: string]: unknown };
};

/**
 * Defines configuration options with type safety.
 * @param config - The configuration options for the application.
 * @returns The same configuration options
 */
export function defineUserConfig<T extends UserConfigOptions>(config: T): T {
  return config;
}

export type InferUserConfig<T extends UserConfigOptions> = T extends {
  entry: () => Promise<{ default: infer U extends Promisable<AppContainer> }>;
}
  ? Awaited<U> extends { __inferredEnvSchema: infer TSchema extends z.ZodTypeAny }
    ? {
        RuntimeEnv: z.TypeOf<TSchema>;
      }
    : never
  : never;

export interface UserConfig {}
