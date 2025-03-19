import * as fs from 'node:fs';
import * as module from 'node:module';
import * as path from 'node:path';

import type { Plugin } from 'esbuild';

const require = module.createRequire(import.meta.url);

const { getBinaryTargetForCurrentPlatform } = require('@prisma/get-platform') as typeof import('@prisma/get-platform');
const { getEnginesPath } = require('@prisma/engines') as typeof import('@prisma/engines');

/**
 * Copy the Prisma query engine to the specified directory
 * @param options
 * @param options.outdir - the location where the engine should be copied
 */
export function prismaPlugin(options: { outdir: string }): Plugin {
  return {
    name: 'prisma',
    setup(build) {
      build.onEnd(async () => {
        const binaryTarget = await getBinaryTargetForCurrentPlatform();
        const enginesDir = getEnginesPath();
        const pattern = new RegExp(`^libquery_engine-${binaryTarget}.*.node$`);
        const engineFile = await fs.promises.readdir(enginesDir).then((files) => {
          return files.find((filename) => filename.match(pattern));
        });
        if (!engineFile) {
          return {
            errors: [
              {
                text: `Failed to find prisma query engine for target '${binaryTarget}' in directory '${enginesDir}'`
              }
            ]
          };
        }
        if (!fs.existsSync(options.outdir)) {
          await fs.promises.mkdir(options.outdir, { recursive: true });
        }

        await fs.promises.copyFile(path.join(enginesDir, engineFile), path.join(options.outdir, engineFile));
        return;
      });
    }
  };
}
