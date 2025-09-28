import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { PrismaModule } from '../src/index.js';
import { CatsModule } from './cats/cats.module.js';

@Module({
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
  ]
})
export class AppModule {}
