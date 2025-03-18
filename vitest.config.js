import * as path from 'path';

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
      exclude: [
        'src/**/?(*.)index.ts',
        'src/**/*.test-d.ts',
        'src/**/*.dto.ts',
        'src/testing/helpers/*',
        'src/user-config.ts'
      ],
      include: ['example/**/*', 'src/**/*'],
      provider: 'v8',
      skipFull: true,
      thresholds: {
        100: true
      }
    },
    globals: true,
    include: ['{example,src}/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    root: './',
    setupFiles: [path.resolve(import.meta.dirname, 'src/testing/setup.ts')],
    watch: false
  }
});
