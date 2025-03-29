import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { Plugin } from 'esbuild';

export function docsPlugin(): Plugin {
  return {
    name: 'docs',
    setup(build): void {
      const options = build.initialOptions;
      const outdir = options.outfile ? path.dirname(options.outfile) : options.outdir!;
      build.onEnd(async () => {
        const assets = path.resolve(import.meta.dirname, '../../docs/assets');
        await fs.cp(assets, path.resolve(outdir, 'assets'), { recursive: true });
      });
    }
  };
}
