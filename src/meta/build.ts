import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { fromAsyncThrowable, ResultAsync } from 'neverthrow';

import { loadUserConfig } from './load.js';
import { parseEntryFromFunction } from './parse.js';
import { prismaPlugin } from './plugins/prisma.js';
import { swcPlugin } from './plugins/swc.js';

import type { UserConfigOptions } from '../user-config.js';

export const bundle = fromAsyncThrowable(
  async ({
    config,
    entrySpecifier,
    resolveDir
  }: {
    config: Pick<UserConfigOptions, 'build' | 'globals'>;
    entrySpecifier: string;
    resolveDir: string;
  }) => {
    const esbuild = await import('esbuild');
    const define: { [key: string]: string } = {
      'process.env.NODE_ENV': "'production'"
    };
    for (const key in config.globals) {
      define[key] = JSON.stringify(config.globals[key]);
    }
    await esbuild.build({
      ...config.build.esbuildOptions,
      banner: {
        js: "Object.defineProperties(globalThis, { __dirname: { value: import.meta.dirname, writable: false }, __filename: { value: import.meta.filename, writable: false }, require: { value: (await import('module')).createRequire(import.meta.url), writable: false } });"
      },
      bundle: true,
      define,
      external: ['@nestjs/microservices', '@nestjs/websockets/socket-module', 'class-transformer', 'class-validator'],
      format: 'esm',
      keepNames: true,
      loader: {
        '.node': 'copy'
      },
      outfile: config.build.outfile,
      platform: 'node',
      plugins: [
        prismaPlugin({
          outdir: path.resolve(path.dirname(config.build.outfile), 'prisma/client')
        }),
        swcPlugin()
      ],
      stdin: {
        contents: [
          `import __appContainerExport from "${entrySpecifier}";`,
          'const __appContainer = await __appContainerExport;',
          config.build.mode === 'module' ? 'export default __appContainer;' : 'await __appContainer.bootstrap();'
        ].join('\n'),
        loader: 'ts',
        resolveDir: resolveDir
      },
      target: ['node22', 'es2022']
    });
  },
  (err) => {
    return new RuntimeException('Failed to build application', {
      cause: err
    });
  }
);

export function buildProd({ configFile }: { configFile: string }): ResultAsync<void, typeof RuntimeException.Instance> {
  return loadUserConfig(configFile).andThen((config) => {
    return parseEntryFromFunction(config.entry).asyncAndThen((entrySpecifier) => {
      return bundle({
        config,
        entrySpecifier,
        resolveDir: path.dirname(configFile)
      });
    });
  });
}
