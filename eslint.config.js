import * as path from 'node:path';

import { config } from '@douglasneuroinformatics/eslint-config';

export default config(
  {
    env: {
      browser: true,
      es2021: true,
      node: true
    },
    exclude: ['build/**/*', 'dist/**/*'],
    react: {
      enabled: true,
      version: '19'
    },
    typescript: {
      enabled: true,
      explicitReturnTypes: true,
      project: path.resolve(import.meta.dirname, 'tsconfig.json')
    }
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-namespace': 'off'
    }
  }
);
