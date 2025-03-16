import { Module } from '@nestjs/common';
import type { DynamicModule, FactoryProvider } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PRISMA_CLIENT_TOKEN } from './prisma.config.js';
import { PrismaFactory } from './prisma.factory.js';
import { PrismaService } from './prisma.service.js';
import { getModelKey, getModelToken } from './prisma.utils.js';

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
          inject: [PrismaFactory],
          provide: PRISMA_CLIENT_TOKEN,
          useFactory: (prismaFactory: PrismaFactory): ExtendedPrismaClient => {
            return prismaFactory.createClient(options);
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
