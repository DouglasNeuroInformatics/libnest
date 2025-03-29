import swc from 'unplugin-swc';
import type { Plugin } from 'vitest/config.js';

const plugin = ({
  baseUrl,
  paths
}: {
  baseUrl?: string;
  paths?: {
    [key: string]: string[];
  };
} = {}): Plugin[] => {
  return [
    swc.vite({
      jsc: {
        baseUrl,
        externalHelpers: true,
        keepClassNames: true,
        parser: {
          decorators: true,
          dynamicImport: true,
          syntax: 'typescript'
        },
        paths,
        target: 'esnext',
        transform: {
          decoratorMetadata: true,
          legacyDecorator: true
        }
      },
      minify: false,
      module: {
        type: 'es6'
      },
      sourceMaps: true
    }),
    {
      enforce: 'pre',
      name: 'vite-plugin-libnest',
      async resolveId(source, _importer, options): Promise<any> {
        if (source.startsWith('@swc/helpers/')) {
          return this.resolve(source, import.meta.filename, options);
        }
        return null;
      }
    }
  ];
};

export default plugin;
