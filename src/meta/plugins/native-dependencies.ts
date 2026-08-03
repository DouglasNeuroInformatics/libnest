import * as fs from 'node:fs/promises';
import * as module from 'node:module';
import * as path from 'node:path';

import type { Plugin } from 'esbuild';

import type { NativeDependency } from '../../user-config.js';

/**
 * Emits the native artifact of each declared dependency beside the bundle, and prepends an assignment
 * pointing the package at it, since a bundled package can no longer find an artifact stored relative
 * to its own source.
 *
 * The artifact is located from the module that actually imported the package during this build, rather
 * than from a lookup rooted in `libnest`. A transitive dependency frequently resolves to a different
 * version than `libnest`'s own, and shipping an artifact that does not match its JavaScript produces a
 * version-mismatch failure on first use.
 */
export function nativeDependenciesPlugin(dependencies: NativeDependency[]): Plugin {
  return {
    name: 'native-dependencies',
    setup(build): void {
      const options = build.initialOptions;
      const outdir = options.outfile ? path.dirname(options.outfile) : options.outdir!;

      // Populated during resolution, consumed once the graph is complete.
      const entryPaths = new Map<string, string>();

      for (const { outputName, runtimeEnvVar } of dependencies) {
        // `??=` so a value supplied by the operator still wins at runtime.
        options.banner!.js! += `process.env.${runtimeEnvVar} ??= import.meta.dirname + '/${outputName}';`;
      }

      build.onResolve({ filter: /.*/, namespace: 'file' }, async (args) => {
        const dependency = dependencies.find(({ packageName }) => {
          return args.path === packageName || args.path.startsWith(`${packageName}/`);
        });
        if (!dependency || entryPaths.has(dependency.packageName)) {
          return null;
        }
        // esbuild passes `pluginName` on this call, so it cannot re-enter this plugin.
        const resolved = await build.resolve(args.path, {
          kind: args.kind,
          resolveDir: args.resolveDir
        });
        if (resolved.path) {
          entryPaths.set(dependency.packageName, resolved.path);
        }
        // Resolution is observed, never altered -- the package itself is still bundled as normal.
        return null;
      });

      build.onEnd(async () => {
        for (const dependency of dependencies) {
          const entryPath = entryPaths.get(dependency.packageName);
          if (!entryPath) {
            throw new Error(
              `Declared native dependency '${dependency.packageName}' was never imported by the application, so its native artifact cannot be located`
            );
          }
          const artifact = await dependency.locate({
            entryPath,
            require: module.createRequire(entryPath)
          });
          const destination = path.join(outdir, dependency.outputName);
          await fs.copyFile(artifact, destination);
          // Copying preserves the source mode, but only when the destination does not already exist.
          await fs.chmod(destination, 0o755);
        }
      });
    }
  };
}
