import * as fs from 'node:fs';
import * as path from 'node:path';

import { getEnginesPath } from '@prisma/engines';
import { getBinaryTargetForCurrentPlatform } from '@prisma/get-platform';
import type { Plugin } from 'esbuild';

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
        const engineFile = (await fs.promises.readdir(enginesDir)).find((filename) => {
          return filename.startsWith(`libquery_engine-${binaryTarget}`) && filename.endsWith('.node');
        });
        if (!engineFile) {
          throw new Error(`Failed to find prisma query engine '${engineFile}' in directory: ${enginesDir}`);
        }
        if (!fs.existsSync(options.outdir)) {
          await fs.promises.mkdir(options.outdir, { recursive: true });
        }
        await fs.promises.copyFile(path.join(enginesDir, engineFile), path.join(options.outdir, engineFile));
      });
    }
  };
}
