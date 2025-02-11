import * as path from 'node:path';

import { config } from '@douglasneuroinformatics/eslint-config';

export default config(
  {
    env: {
      browser: false,
      es2021: true,
      node: true
    },
    typescript: {
      enabled: true,
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
