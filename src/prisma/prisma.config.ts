import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { UserPrismaClient } from '../types.js';

type PrismaModuleOptions = {
  client: UserPrismaClient;
};

const PRISMA_CLIENT_TOKEN = 'PRISMA_CLIENT';

const { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<PrismaModuleOptions>({
    moduleName: 'Prisma'
  })
    .setClassMethodName('forRoot')
    .setExtras({}, (definition) => ({
      ...definition,
      global: true
    }))
    .build();

export {
  ASYNC_OPTIONS_TYPE as PRISMA_ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass as ConfigurablePrismaModule,
  MODULE_OPTIONS_TOKEN as PRISMA_MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE as PRISMA_OPTIONS_TYPE,
  PRISMA_CLIENT_TOKEN
};
export type { PrismaModuleOptions };
