import { type DynamicModule, Module } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import {
  ConfigurablePrismaModule,
  PRISMA_ASYNC_OPTIONS_TYPE,
  PRISMA_MODULE_OPTIONS_TOKEN,
  PRISMA_OPTIONS_TYPE,
  type PrismaModuleOptions
} from './prisma.config.js';
import { PRISMA_CLIENT_TOKEN, PrismaFactory } from './prisma.factory.js';
import { PrismaService } from './prisma.service.js';
import { getModelToken } from './prisma.utils.js';

import type { ExtendedPrismaClient } from './prisma.types.js';

@Module({})
export class PrismaModule extends ConfigurablePrismaModule {
  static forFeature<T extends Prisma.ModelName>(modelName: T): DynamicModule {
    const modelToken = getModelToken(modelName);
    return {
      exports: [modelToken],
      module: PrismaModule,
      providers: [
        {
          inject: [PRISMA_CLIENT_TOKEN],
          provide: modelToken,
          useFactory: (client: ExtendedPrismaClient) => {
            return client[modelName.toLowerCase() as Lowercase<T>];
          }
        }
      ]
    };
  }

  static forRoot(options: typeof PRISMA_OPTIONS_TYPE) {
    return this.createModule(super.forRoot(options));
  }

  static forRootAsync(options: typeof PRISMA_ASYNC_OPTIONS_TYPE) {
    return this.createModule(super.forRootAsync(options));
  }

  private static createModule({ exports = [], providers = [], ...base }: DynamicModule): DynamicModule {
    return {
      ...base,
      exports: [...exports, PRISMA_CLIENT_TOKEN, PrismaService],
      providers: [
        ...providers,
        PrismaService,
        {
          inject: [PRISMA_MODULE_OPTIONS_TOKEN],
          provide: PRISMA_CLIENT_TOKEN,
          useFactory: (options: PrismaModuleOptions) => {
            return PrismaFactory.createClient(options);
          }
        }
      ]
    };
  }
}
