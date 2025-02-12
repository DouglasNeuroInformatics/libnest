import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { PrismaClient } from './prisma.types.js';

const { ASYNC_OPTIONS_TYPE, ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<PrismaClient>({
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
  MODULE_OPTIONS_TOKEN as PRISMA_CLIENT_TOKEN,
  OPTIONS_TYPE as PRISMA_OPTIONS_TYPE
};
