import * as fs from 'node:fs/promises';

import { transform } from '@swc/core';
import type { Plugin } from 'esbuild';

import { SWC_FILTER, SWC_OPTIONS } from '../swc-options.js';

export const swcPlugin = (): Plugin => {
  return {
    name: 'esbuild-plugin-swc',
    setup: (build): void => {
      build.onLoad({ filter: SWC_FILTER }, async (args) => {
        const code = await fs.readFile(args.path, 'utf-8');
        const result = await transform(code, { ...SWC_OPTIONS, filename: args.path });
        return {
          contents: result.code,
          loader: 'js'
        };
      });
    }
  };
};
