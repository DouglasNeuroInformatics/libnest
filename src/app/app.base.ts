import type { DynamicModule, Type } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ConditionalKeys } from 'type-fest';

import { defineToken } from '../utils/token.utils.js';

import type { AppVersion, DocsConfig } from '../docs/docs.factory.js';
import type { UserTypes } from '../user-config.js';
import type { AppModule } from './app.module.js';

export type DynamicAppModule = DynamicModule & {
  module: typeof AppModule;
};

export type ImportedModule = DynamicModule | Type<any>;

export type ConditionalImport = {
  module: ImportedModule;
  when: ConditionalKeys<UserTypes.Env, boolean | undefined>;
};

export type AppContainerParams = {
  docs?: Omit<DocsConfig, 'version'>;
  envConfig: UserTypes.Env;
  module: DynamicAppModule;
  version: AppVersion | null;
};

export abstract class AbstractAppContainer implements AppContainerParams {
  readonly docs?: Omit<DocsConfig, 'version'>;
  readonly envConfig: UserTypes.Env;
  readonly module: DynamicAppModule;
  readonly version: AppVersion | null;

  constructor(params: AppContainerParams) {
    Object.assign(this, params);
  }

  abstract bootstrap(): Promise<void>;

  abstract createApplicationInstance(): Promise<NestFastifyApplication>;
}

export const { CONFIGURE_USER_MIDDLEWARE_TOKEN } = defineToken('CONFIGURE_USER_MIDDLEWARE_TOKEN');

export const { LIBNEST_STATIC_TOKEN } = defineToken('LIBNEST_STATIC_TOKEN');
