import * as fs from 'node:fs/promises';
import * as module from 'node:module';
import * as path from 'node:path';

import type { Plugin } from 'esbuild';

const require = module.createRequire(import.meta.url);

const { getBinaryTargetForCurrentPlatform } = require('@prisma/get-platform') as typeof import('@prisma/get-platform');
const { getEnginesPath } = require('@prisma/engines') as typeof import('@prisma/engines');

export function prismaPlugin(): Plugin {
  return {
    name: 'prisma',
    setup: async (build) => {
      const options = build.initialOptions;
      const outdir = options.outfile ? path.dirname(options.outfile) : options.outdir!;

      const binaryTarget = await getBinaryTargetForCurrentPlatform();
      const enginesDir = getEnginesPath();
      const pattern = new RegExp(`^libquery_engine-${binaryTarget}.*.node$`);
      const engineFile = await fs.readdir(enginesDir).then((files) => {
        return files.find((filename) => filename.match(pattern));
      });
      if (!engineFile) {
        throw new Error(`Failed to find prisma query engine for target '${binaryTarget}' in directory '${enginesDir}'`);
      }

      build.initialOptions.banner!.js! += `process.env.PRISMA_QUERY_ENGINE_LIBRARY = import.meta.dirname + '/' + '${engineFile}'`;

      build.onEnd(async () => {
        return fs.copyFile(path.join(enginesDir, engineFile), path.join(outdir, engineFile));
      });
    }
  };
}
