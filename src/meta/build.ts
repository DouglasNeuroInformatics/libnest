import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import { fromAsyncThrowable, ok, ResultAsync } from 'neverthrow';

import { loadUserConfig } from './load.js';
import { parseEntryFromFunction } from './parse.js';
import { docsPlugin } from './plugins/docs.js';
import { externalPlugin } from './plugins/external.js';
import { prismaPlugin } from './plugins/prisma.js';
import { swcPlugin } from './plugins/swc.js';

import type { UserConfigOptions } from '../user-config.js';

export function buildProd({
  configFile,
  verbose
}: {
  configFile: string;
  verbose?: boolean;
}): ResultAsync<void, typeof RuntimeException.Instance> {
  const logVerbose = (message: string): void => {
    // eslint-disable-next-line no-console
    if (verbose) console.log(message);
  };

  const bundle = fromAsyncThrowable(
    async ({
      config,
      entrySpecifier,
      resolveDir
    }: {
      config: Pick<UserConfigOptions, 'build' | 'globals'>;
      entrySpecifier: string;
      resolveDir: string;
    }) => {
      logVerbose('Attempting to dynamically import esbuild...');
      const esbuild = await import('esbuild');
      logVerbose('Successfully imported esbuild');
      logVerbose('Defining global variables...');
      const define: { [key: string]: string } = {
        'process.env.LIBNEST_INSTANCE_ID': `"${crypto.randomUUID()}"`,
        'process.env.NODE_ENV': "'production'"
      };
      for (const key in config.globals) {
        define[key] = JSON.stringify(config.globals[key]);
      }
      logVerbose(`Set global variables: ${JSON.stringify(define)}`);
      logVerbose('Invoking esbuild to bundle application....');
      const plugins = [docsPlugin(), prismaPlugin(), swcPlugin()];
      if (config.build.bundle === false) {
        plugins.push(externalPlugin());
      }

      await esbuild.build({
        banner: {
          js: "Object.defineProperties(globalThis, { __dirname: { value: import.meta.dirname, writable: false }, __filename: { value: import.meta.filename, writable: false }, require: { value: (await import('module')).createRequire(import.meta.url), writable: false } });"
        },
        bundle: true,
        define,
        external: [
          '@fastify/static',
          '@fastify/view',
          '@nestjs/microservices',
          '@nestjs/websockets/socket-module',
          'class-transformer',
          'class-validator',
          'mongodb-memory-server'
        ],
        format: 'esm',
        keepNames: true,
        loader: {
          '.node': 'copy'
        },
        outfile: config.build.outfile,
        platform: 'node',
        plugins,
        sourcemap: true,
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
      logVerbose('Bundling complete');
    },
    (err) => {
      return new RuntimeException('Failed to build application', {
        cause: err
      });
    }
  );

  return loadUserConfig(configFile).andThen((config) => {
    logVerbose('Successfully loaded user config');
    logVerbose('Attempting to parse entry function...');
    return parseEntryFromFunction(config.entry).asyncAndThen((entrySpecifier) => {
      logVerbose(`Parsed entry specifier '${entrySpecifier}' from user config`);
      logVerbose(`Attempting to bundle application...`);
      return bundle({ config, entrySpecifier, resolveDir: path.dirname(configFile) }).andThen(() => {
        logVerbose('Successfully built application');
        const { onComplete } = config.build;
        if (!onComplete) {
          logVerbose('Done!');
          return ok();
        }
        const callback = fromAsyncThrowable(
          async () => await onComplete(),
          (err) => {
            return new RuntimeException('An error occurred in the user-specified `onComplete` callback', {
              cause: err
            });
          }
        );
        logVerbose('Invoking user-defined onComplete callback');
        return callback().map(() => {
          logVerbose('Done!');
        });
      });
    });
  });
}
