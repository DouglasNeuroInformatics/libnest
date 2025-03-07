import type { z } from 'zod';

/**
 * Configuration options for a `libnest` application.
 */
export type UserConfigOptions = {
  /**
   * The entry point for the `libnest` CLI.
   *
   * This should be a module whose default export is a function that initializes the application.
   */
  entry: () => Promise<{ [key: string]: unknown }>;

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
export function defineUserConfig<T extends UserConfigOptions>(config: T) {
  return config as T & {
    infer: T extends {
      entry: () => Promise<{
        default: {
          __inferredEnvSchema: infer TSchema extends z.ZodTypeAny;
        };
      }>;
    }
      ? {
          RuntimeEnv: z.TypeOf<TSchema>;
        }
      : never;
  };
}

export interface UserConfig {}
