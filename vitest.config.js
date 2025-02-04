import path from 'path';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        externalHelpers: true,
        keepClassNames: true,
        parser: {
          decorators: true,
          dynamicImport: true,
          syntax: 'typescript'
        },
        target: 'es2022',
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
    })
  ],
  test: {
    coverage: {
      exclude: ['**/index.ts', '**/types.ts'],
      include: ['src/**/*'],
      provider: 'v8',
      skipFull: true
      // thresholds: {
      //   branches: 100,
      //   functions: 100,
      //   lines: 100,
      //   statements: 100
      // }
    },
    globals: true,
    root: './',
    setupFiles: [path.resolve(import.meta.dirname, 'src/testing/setup.ts')],
    watch: false
  }
});
