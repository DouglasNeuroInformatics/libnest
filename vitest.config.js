import * as path from 'path';

import { defineConfig } from 'vitest/config';

import libnest from './src/testing/plugin.js';

export default defineConfig({
  plugins: [libnest()],
  root: import.meta.dirname,
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
    setupFiles: [path.resolve(import.meta.dirname, 'src/testing/setup.ts')],
    watch: false
  }
});
