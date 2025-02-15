/**
 * This module provides a helper function to setup a `libnest` application.
 * @module config
 */

/**
 * Configuration options for a `libnest` application.
 */
export interface ConfigOptions {
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
 * Defines configuration options with type safety.
 * @param config - The configuration options for the application.
 * @returns The same configuration options
 */
export function defineConfig(config: ConfigOptions) {
  return config;
}

export type { RuntimePrismaClient } from '../prisma/prisma.types.js';
export { $BaseEnv } from './schema.js';
export type { BaseEnv, RuntimeEnv } from './schema.js';
