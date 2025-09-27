import { PrismaClient } from '@prisma/client';

import { $BaseEnv, acceptLanguage, AppFactory } from '../src/index.js';
import { PrismaModule } from '../src/modules/prisma/prisma.module.js';
import { CatsModule } from './cats/cats.module.js';

export default AppFactory.create({
  configureMiddleware: (consumer) => {
    const middleware = acceptLanguage({ fallbackLanguage: 'en', supportedLanguages: ['en', 'fr'] });
    consumer.apply(middleware).forRoutes('*');
  },
  docs: {
    path: '/docs',
    title: 'Example API'
  },
  envSchema: $BaseEnv,
  imports: [
    CatsModule,
    PrismaModule.forRootAsync({
      inject: ['MONGO_CONNECTION'],
      provideInjectionTokensFrom: [
        {
          provide: 'MONGO_CONNECTION',
          useFactory: async (): Promise<string> => {
            const { MongoMemoryReplSet } = await import('mongodb-memory-server');
            const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, name: 'rs0' } });
            return new URL(replSet.getUri('test')).href;
          }
        }
      ],
      useFactory: (mongoConnection: string) => {
        return {
          client: new PrismaClient({
            datasourceUrl: mongoConnection
          })
        };
      }
    })
  ],
  version: null
});
