import type { ConditionalKeys, IfEmptyObject, Jsonifiable, Promisable } from 'type-fest';

import type { BaseEnv } from './schemas/env.schema.js';

/** A `require` rooted at a specific module, so lookups resolve in the application's dependency graph. */
type ResolvedRequire = ReturnType<typeof import('node:module').createRequire>;

/** Packages `libnest` ships a built-in {@link NativeDependency} recipe for. */
export type KnownNativeDependencyName = 'esbuild';

export type NativeDependencyContext = {
  /** Absolute path of the resolved module that pulled the dependency into the bundle. */
  entryPath: string;
  /** A `require` rooted at {@link NativeDependencyContext.entryPath}. */
  require: ResolvedRequire;
};

/**
 * A dependency that loads a native artifact through a path relative to its own source, and so cannot
 * survive being bundled. The artifact is emitted beside the bundle, and the package is pointed back at
 * it by an environment variable set before the application starts.
 */
export type NativeDependency = {
  /** Returns the absolute path of the artifact to emit. */
  locate: (context: NativeDependencyContext) => Promisable<string>;
  /** The filename to write into the output directory, beside the bundle. */
  outputName: string;
  /** The bare specifier the application imports, e.g. `esbuild`. */
  packageName: string;
  /** The environment variable the package reads at runtime to locate its artifact. */
  runtimeEnvVar: string;
};

/**
 * Configuration options for a `libnest` application.
 */
export type UserConfigOptions = {
  /** Configuration options for the production build */
  build: {
    bundle?: boolean;
    mode?: 'module' | 'server';
    /**
     * Dependencies that cannot survive bundling, because they load a native artifact through a path
     * relative to their own source. Each is emitted next to the bundle and redirected there at
     * startup. Naming one the application never imports fails the build.
     */
    nativeDependencies?: (KnownNativeDependencyName | NativeDependency)[];
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
