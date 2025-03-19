import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import * as lexer from 'es-module-lexer';
import type { Plugin } from 'esbuild';
import { fromAsyncThrowable, ok, Result, ResultAsync } from 'neverthrow';

import { loadConfig } from './meta.utils.js';

import type { UserConfigOptions } from '../user-config.js';

await lexer.init;

function parseEntryFromFunction(entry: (...args: any[]) => any): Result<string, typeof RuntimeException.Instance> {
  const source = entry.toString();
  const [imports] = lexer.parse(source);
  if (imports.length !== 1) {
    return RuntimeException.asErr(`Entry function must include exactly one import: found ${imports.length}`, {
      details: {
        source
      }
    });
  }
  const importSpecifier = imports[0]!;
  if (importSpecifier.t !== lexer.ImportType.Dynamic) {
    return RuntimeException.asErr(
      `Entry function must contain dynamic import: found ${lexer.ImportType[importSpecifier.t]}`,
      {
        details: {
          source
        }
      }
    );
  } else if (!importSpecifier.n) {
    return RuntimeException.asErr('Dynamic import in entry function must import a string literal', {
      details: {
        source
      }
    });
  }
  return ok(importSpecifier.n);
}

const swcPlugin = (): Plugin => {
  return {
    name: 'esbuild-plugin-swc',
    setup: async (build) => {
      const { transform } = await import('@swc/core');
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

const build = fromAsyncThrowable(
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
      plugins: [swcPlugin()],
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

function bundle({ configFile }: { configFile: string }): ResultAsync<void, typeof RuntimeException.Instance> {
  return loadConfig(configFile).andThen((config) => {
    return parseEntryFromFunction(config.entry).asyncAndThen((entrySpecifier) => {
      return build({
        config,
        entrySpecifier,
        resolveDir: path.dirname(configFile)
      });
    });
  });
}

export { build, bundle, parseEntryFromFunction, swcPlugin };
