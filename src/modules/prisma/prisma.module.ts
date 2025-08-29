import { Global, Module } from '@nestjs/common';
import type { ConfigurableModuleAsyncOptions, DynamicModule, FactoryProvider } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

import { ConfigurablePrismaModule, PRISMA_CLIENT_TOKEN, PRISMA_MODULE_OPTIONS_TOKEN } from './prisma.config.js';
import { PrismaService } from './prisma.service.js';
import { getModelKey, getModelToken } from './prisma.utils.js';

import type { PrismaModuleOptions } from './prisma.config.js';
import type { PrismaClientLike } from './prisma.types.js';

const MODEL_PROVIDERS: FactoryProvider[] = Object.keys(Prisma.ModelName).map((modelName) => {
  return {
    inject: [PRISMA_CLIENT_TOKEN],
    provide: getModelToken(modelName),
    useFactory: (prismaClient: PrismaClientLike): unknown => {
      return prismaClient[getModelKey(modelName)];
    }
  };
});

const MODEL_TOKENS = MODEL_PROVIDERS.map((provider) => provider.provide);

@Global()
@Module({
  exports: [PRISMA_CLIENT_TOKEN, PrismaService, ...MODEL_TOKENS],
  providers: [
    {
      inject: [PRISMA_MODULE_OPTIONS_TOKEN],
      provide: PRISMA_CLIENT_TOKEN,
      useFactory: (options: PrismaModuleOptions): PrismaClientLike => {
        return options.client;
      }
    },
    PrismaService,
    ...MODEL_PROVIDERS
  ]
})
export class PrismaModule extends ConfigurablePrismaModule {
  static forRoot<TPrismaClient extends PrismaClient>(options: PrismaModuleOptions<TPrismaClient>): DynamicModule {
    return super.forRoot(options);
  }

  static forRootAsync<TPrismaClient extends PrismaClient>(
    options: ConfigurableModuleAsyncOptions<PrismaModuleOptions<TPrismaClient>>
  ): DynamicModule {
    return super.forRootAsync(options);
  }
}
