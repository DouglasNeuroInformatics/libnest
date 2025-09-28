import type { ConditionalKeys, IfEmptyObject, Jsonifiable, Promisable } from 'type-fest';

import type { BaseEnv } from './schemas/env.schema.js';

/**
 * Configuration options for a `libnest` application.
 */
export type UserConfigOptions = {
  /** Configuration options for the production build */
  build: {
    mode?: 'module' | 'server';
    /** A callback function to invoke when the build is complete */
    onComplete?: () => Promisable<void>;
    /** The path where the bundle should be written */
    outfile: string;
  };
  /**
   * The entry point for the `libnest` CLI.
   *
   * This should be a module whose default export is a function that initializes the application.
   */
  entry: () => Promise<{ [key: string]: any }>;

  /**
   * Optional global variables that should be defined at runtime.
   */
  globals?: { [key: string]: Jsonifiable };
};

/**
 * Defines configuration options with type safety.
 * @param config - The configuration options for the application.
 * @returns The same configuration options
 */
export function defineUserConfig<T extends UserConfigOptions>(config: T): T {
  return config;
}

export interface UserConfig {}

export namespace UserTypes {
  export interface Env extends BaseEnv {}
  export interface Locales {}
  export interface PrismaClient {
    [key: string]: any;
  }
  export interface RequestUser {
    [key: string]: unknown;
  }

  export type Locale = IfEmptyObject<Locales, string, ConditionalKeys<Locales, true>>;
}

export type RequestUser = UserTypes.RequestUser;
