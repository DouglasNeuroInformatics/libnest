import { Global, Module } from '@nestjs/common';
import type { FactoryProvider } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ConfigurablePrismaModule, PRISMA_CLIENT_TOKEN, PRISMA_MODULE_OPTIONS_TOKEN } from './prisma.config.js';
import { getModelKey, getModelToken } from './prisma.utils.js';

import type { UserTypes } from '../../user-config.js';
import type { PrismaModuleOptions } from './prisma.config.js';

const MODEL_PROVIDERS: FactoryProvider[] = Object.keys(Prisma.ModelName).map((modelName) => {
  return {
    inject: [PRISMA_CLIENT_TOKEN],
    provide: getModelToken(modelName),
    useFactory: (prismaClient: UserTypes.PrismaClient): unknown => {
      return prismaClient[getModelKey(modelName)];
    }
  };
});

const MODEL_TOKENS = MODEL_PROVIDERS.map((provider) => provider.provide);

@Global()
@Module({
  exports: [PRISMA_CLIENT_TOKEN, ...MODEL_TOKENS],
  providers: [
    {
      inject: [PRISMA_MODULE_OPTIONS_TOKEN],
      provide: PRISMA_CLIENT_TOKEN,
      useFactory: (options: PrismaModuleOptions): unknown => {
        return options.client;
      }
    },
    ...MODEL_PROVIDERS
  ]
})
export class PrismaModule extends ConfigurablePrismaModule {}
