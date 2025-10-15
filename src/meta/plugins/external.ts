import type { Plugin } from 'esbuild';

export function externalPlugin(): Plugin {
  return {
    name: 'external',
    setup(build): void {
      build.onResolve({ filter: /.*/, namespace: 'file' }, async (args) => {
        const resolved = await build.resolve(args.path, {
          kind: args.kind,
          resolveDir: args.resolveDir
        });
        if (resolved.path.includes('node_modules')) {
          return { external: true, path: args.path };
        }
        return null;
      });
    }
  };
}
