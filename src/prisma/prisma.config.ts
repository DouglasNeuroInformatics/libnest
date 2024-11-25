import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

type PrismaModuleOptions = Prisma.PrismaClientOptions;

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
  OPTIONS_TYPE as PRISMA_OPTIONS_TYPE
};
export type { PrismaModuleOptions };
