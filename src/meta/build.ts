import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { fromAsyncThrowable, ResultAsync } from 'neverthrow';

import { loadUserConfig } from './load.js';
import { parseEntryFromFunction } from './parse.js';
import { docsPlugin } from './plugins/docs.js';
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
      plugins: [docsPlugin(), prismaPlugin(), swcPlugin()],
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

export function buildProd({
  configFile,
  verbose
}: {
  configFile: string;
  verbose?: boolean;
}): ResultAsync<void, typeof RuntimeException.Instance> {
  const logVerbose = (message: string): void => {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  };
  return loadUserConfig(configFile).andThen((config) => {
    logVerbose('Successfully loaded user config');
    logVerbose('Attempting to parse entry function...');
    return parseEntryFromFunction(config.entry).asyncAndThen((entrySpecifier) => {
      logVerbose(`Parsed entry specifier '${entrySpecifier}' from user config`);
      logVerbose(`Attempting to bundle application...`);
      const result = bundle({
        config,
        entrySpecifier,
        resolveDir: path.dirname(configFile)
      });
      logVerbose('Successfully bundled application');
      const { onComplete } = config.build;
      if (onComplete) {
        const callback = fromAsyncThrowable(
          async () => {
            logVerbose('Invoking user-defined onComplete callback');
            await onComplete();
            logVerbose('Done!');
          },
          (err) => {
            return new RuntimeException('An error occurred in the user-specified `onComplete` callback', {
              cause: err
            });
          }
        );
        return result.andThen(callback);
      }
      logVerbose('Done!');
      return result;
    });
  });
}
