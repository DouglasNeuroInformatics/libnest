import type { KnownNativeDependencyName, NativeDependency } from '../user-config.js';

/**
 * Built-in recipes, so naming the package is enough for the common cases.
 *
 * Each `locate` resolves through the `require` of the module that imported the package, never through
 * `libnest`'s own. The application and `libnest` routinely resolve different versions of the same
 * dependency, and pairing an artifact with a different version of its own JavaScript fails at runtime.
 */
const KNOWN_NATIVE_DEPENDENCIES = {
  esbuild: {
    // The executable lives in a per-platform sibling package listed in esbuild's optionalDependencies.
    // `ESBUILD_BINARY_PATH` both points esbuild at it and suppresses esbuild's refusal to run from a
    // bundle, which it otherwise detects by comparing __filename against its own layout.
    locate: ({ require }): string => require.resolve(`@esbuild/${process.platform}-${process.arch}/bin/esbuild`),
    outputName: 'esbuild',
    packageName: 'esbuild',
    runtimeEnvVar: 'ESBUILD_BINARY_PATH'
  }
} satisfies { [K in KnownNativeDependencyName]: NativeDependency };

const KNOWN_NATIVE_DEPENDENCY_NAMES = Object.keys(KNOWN_NATIVE_DEPENDENCIES) as [
  KnownNativeDependencyName,
  ...KnownNativeDependencyName[]
];

function resolveNativeDependency(dependency: KnownNativeDependencyName | NativeDependency): NativeDependency {
  return typeof dependency === 'string' ? KNOWN_NATIVE_DEPENDENCIES[dependency] : dependency;
}

export { KNOWN_NATIVE_DEPENDENCIES, KNOWN_NATIVE_DEPENDENCY_NAMES, resolveNativeDependency };
