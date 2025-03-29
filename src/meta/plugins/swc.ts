import * as fs from 'node:fs/promises';

import { transform } from '@swc/core';
import type { Plugin } from 'esbuild';

export const swcPlugin = (): Plugin => {
  return {
    name: 'esbuild-plugin-swc',
    setup: (build): void => {
      build.onLoad({ filter: /\.(ts)$/ }, async (args) => {
        const code = await fs.readFile(args.path, 'utf-8');
        const result = await transform(code, {
          filename: args.path,
          isModule: true,
          jsc: {
            parser: {
              decorators: true,
              syntax: 'typescript'
            },
            target: 'esnext',
            transform: {
              decoratorMetadata: true,
              legacyDecorator: true
            }
          },
          module: {
            type: 'es6'
          }
        });
        return {
          contents: result.code,
          loader: 'js'
        };
      });
    }
  };
};
