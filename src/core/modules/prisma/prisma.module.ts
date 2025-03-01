import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';

import { PRISMA_CLIENT_TOKEN } from './prisma.config.js';
import { PrismaService } from './prisma.service.js';
import { getModelRef, getModelToken } from './prisma.utils.js';

import type { PrismaModuleOptions } from './prisma.config.js';
import type { PrismaClientLike, PrismaModelName } from './prisma.types.js';

@Module({})
export class PrismaModule {
  static forRoot({ client, modelNames }: PrismaModuleOptions): DynamicModule {
    const modelProviders = this.getModelProviders(client, modelNames);
    return {
      exports: [PRISMA_CLIENT_TOKEN, PrismaService, ...modelProviders.map((provider) => provider.provide)],
      global: true,
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_CLIENT_TOKEN,
          useValue: client
        },
        PrismaService,
        ...modelProviders
      ]
    };
  }

  private static getModelProviders(client: PrismaClientLike, modelNames: PrismaModelName[]) {
    return modelNames.map((modelName) => {
      return {
        provide: getModelToken(modelName),
        useValue: client[getModelRef(modelName)] as unknown
      };
    });
  }
}
