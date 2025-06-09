import { Module } from '@nestjs/common';
import type { DynamicModule, FactoryProvider } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ConnectionFactory } from './connection.factory.js';
import { MONGO_CONNECTION_TOKEN, PRISMA_CLIENT_TOKEN, PRISMA_MODULE_OPTIONS_TOKEN } from './prisma.config.js';
import { PrismaFactory } from './prisma.factory.js';
import { PrismaService } from './prisma.service.js';
import { getModelKey, getModelToken } from './prisma.utils.js';

import type { MongoConnection } from './connection.factory.js';
import type { PrismaModuleOptions } from './prisma.config.js';
import type { ExtendedPrismaClient } from './prisma.factory.js';
import type { PrismaClientLike } from './prisma.types.js';

@Module({})
export class PrismaModule {
  static forRoot(options: PrismaModuleOptions): DynamicModule {
    const modelProviders = this.getModelProviders();
    const modelTokens = modelProviders.map((provider) => provider.provide);
    return {
      exports: [PRISMA_CLIENT_TOKEN, PrismaService, ...modelTokens],
      global: true,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_MODULE_OPTIONS_TOKEN,
          useValue: options
        },
        {
          inject: [ConnectionFactory],
          provide: MONGO_CONNECTION_TOKEN,
          useFactory: (connectionFactory: ConnectionFactory): Promise<MongoConnection> => {
            return connectionFactory.create();
          }
        },
        {
          inject: [PrismaFactory, PRISMA_MODULE_OPTIONS_TOKEN],
          provide: PRISMA_CLIENT_TOKEN,
          useFactory: (prismaFactory: PrismaFactory, { clientOptions }: PrismaModuleOptions): ExtendedPrismaClient => {
            return prismaFactory.createClient(clientOptions ?? {});
          }
        },
        ConnectionFactory,
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
