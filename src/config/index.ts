/**
 * This module provides a helper function to setup a `libnest` application.
 * @module config
 */

import type { z } from 'zod';

import type { PrismaClientLike } from '../core/modules/prisma/prisma.types.js';

/**
 * Configuration options for a `libnest` application.
 */
export interface ConfigOptions {
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
}

export type InferredConfigType<T extends ConfigOptions> = T extends {
  entry: () => Promise<{
    default: {
      _inferOptions: {
        envSchema: infer TSchema extends z.ZodTypeAny;
        prisma: {
          client: infer TPrismaClient extends PrismaClientLike;
        };
      };
    };
  }>;
}
  ? {
      RuntimeEnv: z.TypeOf<TSchema>;
      RuntimePrismaClient: TPrismaClient;
    }
  : never;

/**
 * Defines configuration options with type safety.
 * @param config - The configuration options for the application.
 * @returns The same configuration options
 */
export function defineConfig<T extends ConfigOptions>(config: T) {
  return config as T & {
    infer: InferredConfigType<T>;
  };
}

export interface UserConfig {}

export { $BaseEnv } from './schema.js';
export type { BaseEnv } from './schema.js';
