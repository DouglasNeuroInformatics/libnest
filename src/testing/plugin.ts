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
      // config(config): void {
      //   console.log(config);
      // },
      name: 'vite-plugin-libnest'
    }
  ];
};

export default plugin;
