import { Module } from '@nestjs/common';
import type { DynamicModule, FactoryProvider } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ConfigService } from '../config/config.service.js';
import { MONGO_CONNECTION_TOKEN, PRISMA_CLIENT_TOKEN } from './prisma.config.js';
import { PrismaFactory } from './prisma.factory.js';
import { PrismaService } from './prisma.service.js';
import { getModelKey, getModelToken } from './prisma.utils.js';

import type { PrismaModuleOptions } from './prisma.config.js';
import type { ExtendedPrismaClient } from './prisma.factory.js';
import type { PrismaClientLike } from './prisma.types.js';

@Module({})
export class PrismaModule {
  static forRoot({ dbPrefix, omit }: PrismaModuleOptions): DynamicModule {
    const modelProviders = this.getModelProviders();
    const modelTokens = modelProviders.map((provider) => provider.provide);
    return {
      exports: [PRISMA_CLIENT_TOKEN, PrismaService, ...modelTokens],
      global: true,
      module: PrismaModule,
      providers: [
        {
          inject: [ConfigService],
          provide: MONGO_CONNECTION_TOKEN,
          useFactory: (configService: ConfigService): string => {
            const mongoUri = configService.get('MONGO_URI');
            const env = configService.get('NODE_ENV');
            const url = new URL(`${mongoUri.href}/${dbPrefix}-${env}`);
            const params = {
              directConnection: configService.get('MONGO_DIRECT_CONNECTION'),
              replicaSet: configService.get('MONGO_REPLICA_SET'),
              retryWrites: configService.get('MONGO_RETRY_WRITES'),
              w: configService.get('MONGO_WRITE_CONCERN')
            };
            for (const [key, value] of Object.entries(params)) {
              if (value) {
                url.searchParams.append(key, String(value));
              }
            }
            return url.href;
          }
        },
        {
          inject: [PrismaFactory],
          provide: PRISMA_CLIENT_TOKEN,
          useFactory: (prismaFactory: PrismaFactory): ExtendedPrismaClient => {
            return prismaFactory.createClient({ omit });
          }
        },
        PrismaFactory,
        PrismaService,
        ...modelProviders
      ]
    };
  }

  private static getModelProviders(): FactoryProvider[] {
    return Object.keys(Prisma.ModelName).map((modelName) => {
      return {
        inject: [PRISMA_CLIENT_TOKEN],
        provide: getModelToken(modelName),
        useFactory: (prismaClient: PrismaClientLike): unknown => {
          return prismaClient[getModelKey(modelName)];
        }
      };
    });
  }
}
