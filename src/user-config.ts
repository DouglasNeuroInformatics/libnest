import type { BuildOptions } from 'esbuild';
import type { Jsonifiable, Promisable } from 'type-fest';

import type { AppContainer } from './app/app.container.js';
import type { DefaultPrismaClientOptions } from './modules/prisma/prisma.config.js';
import type { BaseEnv } from './schemas/env.schema.js';

/**
 * Configuration options for a `libnest` application.
 */
export type UserConfigOptions = {
  /** Configuration options for the production build */
  build: {
    /** Additional options to pass to esbuild */
    esbuildOptions?: Pick<BuildOptions, 'footer'>;
    /**
     * The type of bundle to generate. If set to `module`, the bundle will be a module with
     * the AppContainer as the default export. If set to standalone, running the bundle will
     * launch the production server.
     * @default 'server'
     */
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

export type InferUserConfig<T extends UserConfigOptions> = T extends {
  entry: () => Promise<{
    default: AppContainer<infer TEnv extends BaseEnv, infer TPrismaClientOptions extends DefaultPrismaClientOptions>;
  }>;
}
  ? {
      RuntimeEnv: TEnv;
      RuntimePrismaClientOptions: TPrismaClientOptions;
    }
  : never;

export interface CustomTypeOptions {}

export interface UserConfig {}
