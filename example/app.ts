import { $BaseEnv } from '@douglasneuroinformatics/libnest/config';
import { AppFactory } from '@douglasneuroinformatics/libnest/core';

import { CatsModule } from './cats/cats.module.js';

export default AppFactory.create({
  docs: {
    config: {
      title: 'Example API'
    },
    path: '/spec.json'
  },
  imports: [CatsModule],
  schema: $BaseEnv,
  version: '1'
});
