/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import swc from 'unplugin-swc';
import type { Plugin } from 'vitest/config.js';

const plugin = ({
  baseUrl,
  config,
  paths
}: {
  baseUrl?: string;
  config?: string;
  paths?: {
    [key: string]: string[];
  };
} = {}): [Plugin, Plugin] => {
  return [
    swc.vite({
      jsc: {
        baseUrl,
        externalHelpers: true,
        keepClassNames: true,
        parser: {
          decorators: true,
          dynamicImport: true,
          syntax: 'typescript',
          tsx: true
        },
        paths,
        target: 'esnext',
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true,
          react: {
            runtime: 'automatic'
          }
        }
      },
      minify: false,
      module: {
        type: 'es6'
      },
      sourceMaps: true
    }),
    {
      async config(baseConfig) {
        let configInfo: null | { filepath: string; source: string } = null;
        if (config) {
          configInfo = {
            filepath: config,
            source: "value for 'config' option for libnest plugin in vitest config"
          };
        } else if (process.env.LIBNEST_CONFIG_FILEPATH) {
          configInfo = {
            filepath: process.env.LIBNEST_CONFIG_FILEPATH,
            source: "environment variable 'LIBNEST_CONFIG_FILEPATH'"
          };
        } else if (baseConfig.root && path.isAbsolute(baseConfig.root)) {
          const filename = await fs
            .readdir(baseConfig.root)
            .then((files) => files.find((filename) => /libnest\.config\.(t|j)s/.exec(filename)));
          if (filename) {
            configInfo = {
              filepath: path.join(baseConfig.root, filename),
              source: "value for 'root' option in vitest config"
            };
          }
        }
        if (!configInfo) {
          throw new Error(
            'Could not determine path to libnest config file: please specify it explicitly in the libnest vitest plugin options'
          );
        }
        return {
          define: {
            __LIBNEST_STATIC: JSON.stringify({ configFile: configInfo.filepath } satisfies LibnestStatic),
            'process.env.LIBNEST_CONFIG_FILEPATH': `"${configInfo.filepath}"`
          }
        };
      },
      enforce: 'pre',
      name: 'libnest',
      async resolveId(source, _importer, options) {
        if (source.startsWith('@swc/helpers/')) {
          return this.resolve(source, import.meta.filename, options);
        }
        return null;
      }
    }
  ];
};

export default plugin;
