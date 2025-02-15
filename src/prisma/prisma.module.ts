import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';

import {
  ConfigurablePrismaModule,
  PRISMA_ASYNC_OPTIONS_TYPE,
  PRISMA_CLIENT_TOKEN,
  PRISMA_OPTIONS_TYPE
} from './prisma.config.js';
import { PrismaService } from './prisma.service.js';
import { getModelToken } from './prisma.utils.js';

import type { PrismaModelName, RuntimePrismaClient } from './prisma.types.js';

@Module({})
export class PrismaModule extends ConfigurablePrismaModule {
  static forFeature<T extends PrismaModelName>(modelName: T): DynamicModule {
    const modelToken = getModelToken(modelName);
    return {
      exports: [modelToken],
      module: PrismaModule,
      providers: [
        {
          inject: [PRISMA_CLIENT_TOKEN],
          provide: modelToken,
          useFactory: (client: RuntimePrismaClient) => {
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
      providers: [...providers, PrismaService]
    };
  }
}
