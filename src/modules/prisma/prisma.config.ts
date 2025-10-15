import { ConfigurableModuleBuilder } from '@nestjs/common';

import { defineToken } from '../../utils/token.utils.js';

export type PrismaModuleOptions = {
  client: any;
};

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');

export const { ConfigurableModuleClass: ConfigurablePrismaModule, MODULE_OPTIONS_TOKEN: PRISMA_MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<PrismaModuleOptions>().setClassMethodName('forRoot').build();
