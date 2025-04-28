import type { DynamicModule, Type } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ConditionalKeys } from 'type-fest';

import { defineToken } from '../utils/token.utils.js';

import type { AppVersion, DocsConfig } from '../docs/docs.factory.js';
import type { BaseEnv } from '../schemas/env.schema.js';
import type { AppModule } from './app.module.js';

export type DynamicAppModule = DynamicModule & {
  module: typeof AppModule;
};

export type ImportedModule = DynamicModule | Type<any>;

export type ConditionalImport<TEnv extends BaseEnv = BaseEnv> = {
  module: ImportedModule;
  when: ConditionalKeys<TEnv, boolean | undefined>;
};

export type AppContainerParams<TEnv extends BaseEnv = BaseEnv> = {
  docs?: Omit<DocsConfig, 'version'>;
  envConfig: TEnv;
  module: DynamicAppModule;
  version: AppVersion | null;
};

export abstract class AbstractAppContainer<TEnv extends BaseEnv = BaseEnv> implements AppContainerParams<TEnv> {
  readonly docs?: Omit<DocsConfig, 'version'>;
  readonly envConfig: TEnv;
  readonly module: DynamicAppModule;
  readonly version: AppVersion | null;

  constructor(params: AppContainerParams<TEnv>) {
    Object.assign(this, params);
  }

  abstract bootstrap(): Promise<void>;

  abstract createApplicationInstance(): Promise<NestExpressApplication>;
}

export const { CONFIGURE_USER_MIDDLEWARE_TOKEN } = defineToken('CONFIGURE_USER_MIDDLEWARE_TOKEN');
