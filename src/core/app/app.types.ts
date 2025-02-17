import type { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Promisable, Simplify } from 'type-fest';
import type { z } from 'zod';

import type { RuntimeEnv } from '../../config/schema.js';
import type { JSONLogger } from '../logging/json.logger.js';
import type { AppModule } from './app.module.js';

export type DynamicAppModule = DynamicModule & {
  module: typeof AppModule;
};

export type ConfigSchema = z.ZodType<RuntimeEnv, z.ZodTypeDef, { [key: string]: string }>;

export type ImportedModule = NonNullable<ModuleMetadata['imports']>[number];

export type DocsConfig = {
  contact?: {
    email: string;
    name: string;
    url: string;
  };
  description?: string;
  externalDoc?: {
    description: string;
    url: string;
  };
  license?: {
    name: string;
    url: string;
  };
  tags?: string[];
  title: string;
  version?: `${number}`;
};

export type CreateAppContainerOptions = Simplify<
  Pick<CreateAppOptions, 'docs' | 'version'> & {
    config: RuntimeEnv;
    module: DynamicAppModule;
  }
>;

export type CreateAppOptions = {
  callback: (app: NestExpressApplication, config: RuntimeEnv, logger: JSONLogger) => Promisable<void>;
  docs?: {
    config: Omit<DocsConfig, 'version'>;
    path: `/${string}.json`;
  };
  imports?: ImportedModule[];
  providers?: Provider[];
  schema: ConfigSchema;
  version: `${number}`;
};
