/**
 * This module provides a helper function to setup for the `libnest` CLI. It also
 * exports interfaces that users can augment in their application.
 * @module user-config
 */

import type { BaseRuntimeConfig } from './config/config.schema.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
    interface User {
      [key: string]: unknown;
    }
  }
}

/**
 * Represents the parsed environment variables available at runtime.
 *
 * This type should be augmented by users to include additional configuration properties in their schema.
 *
 * ### Example:
 * ```typescript
 * declare module '@douglasneuroinformatics/libnest' {
 *   export interface RuntimeConfig {
 *     foo: string;
 *   }
 * }
 * ```
 */
export interface RuntimeConfig extends BaseRuntimeConfig {}

/**
 * Represents the runtime `PrismaClient` for your application. Users should augment
 * this declaration with their own `PrismaClient`.
 */
export type { PrismaClient } from './prisma/prisma.types.js';

/**
 * Configuration options for the user-defined settings in the `libnest` CLI.
 */
export interface UserConfigOptions {
  /**
   * The entry point for the `libnest` CLI.
   *
   * This should be a module whose default export is a function that initializes the application.
   */
  entry: string;

  /**
   * Optional global variables that should be defined at runtime.
   */
  globals?: { [key: string]: unknown };
}

/**
 * Defines user configuration options with type safety.
 * @param config - The configuration options for the application.
 * @returns The same configuration options
 */
export function defineUserConfig(config: UserConfigOptions) {
  return config;
}
