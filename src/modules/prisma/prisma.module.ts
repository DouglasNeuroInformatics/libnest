import { Module } from '@nestjs/common';
import type { ConfigurableModuleAsyncOptions, DynamicModule, FactoryProvider } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ConfigurablePrismaModule, PRISMA_CLIENT_TOKEN, PRISMA_MODULE_OPTIONS_TOKEN } from './prisma.config.js';
import { PrismaService } from './prisma.service.js';
import { getModelKey, getModelToken } from './prisma.utils.js';

import type { PrismaModuleOptions } from './prisma.config.js';
import type { PrismaClientLike } from './prisma.types.js';

@Module({
  providers: [
    {
      inject: [PRISMA_MODULE_OPTIONS_TOKEN],
      provide: PRISMA_CLIENT_TOKEN,
      useFactory: (options: PrismaModuleOptions): PrismaClientLike => {
        return options.client;
      }
    },
    PrismaService,
    ...Object.keys(Prisma.ModelName).map((modelName) => {
      return {
        inject: [PRISMA_CLIENT_TOKEN],
        provide: getModelToken(modelName),
        useFactory: (prismaClient: PrismaClientLike): unknown => {
          return prismaClient[getModelKey(modelName)];
        }
      } satisfies FactoryProvider;
    })
  ]
})
export class PrismaModule extends ConfigurablePrismaModule {
  static forRoot(options: PrismaModuleOptions): DynamicModule {
    return super.forRoot(options);
  }

  static forRootAsync(options: ConfigurableModuleAsyncOptions<PrismaModuleOptions>): DynamicModule {
    return super.forRootAsync(options);
  }
}
