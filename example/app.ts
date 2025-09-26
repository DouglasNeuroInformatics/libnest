import { PrismaClient } from '@prisma/client';

import { $BaseEnv, AppFactory } from '../src/index.js';
import { CatsModule } from './cats/cats.module.js';

export default AppFactory.create({
  docs: {
    path: '/docs',
    title: 'Example API'
  },
  envSchema: $BaseEnv,
  imports: [CatsModule],
  prisma: {
    client: {
      constructor: PrismaClient
    },
    dbPrefix: 'libnest-example',
    useInMemoryDbForTesting: true
  },
  version: null
});
