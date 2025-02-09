import { Module } from '@nestjs/common';
import type { ModuleMetadata } from '@nestjs/common';
import type { ConditionalKeys } from 'type-fest';
import type { z } from 'zod';

import { type InternalDynamicModule, InternalModuleFactory } from '../core/factories/internal-module.factory.js';
import { ConfigService } from './config.service.js';
import { CONFIG_TOKEN } from './config.token.js';

import type { RuntimeConfig } from '../types.js';

export type ConfigSchema<TConfig extends RuntimeConfig = RuntimeConfig> = z.ZodType<
  TConfig,
  z.ZodTypeDef,
  { [key: string]: string }
>;

export type ConfigModuleOptions<TConfig extends RuntimeConfig = RuntimeConfig> = {
  conditionalModules?: {
    module: Required<ModuleMetadata>['imports'][number];
    when: ConditionalKeys<TConfig, boolean | undefined>;
  }[];
  schema: ConfigSchema<TConfig>;
};

@Module({})
export class ConfigModule {
  static forRoot<TConfig extends RuntimeConfig = RuntimeConfig>({
    conditionalModules,
    schema
  }: ConfigModuleOptions<TConfig>): InternalDynamicModule {
    const result = schema.safeParse(process.env);
    if (!result.success) {
      throw new Error('Failed to Parse Environment Variables', {
        cause: {
          issues: result.error.issues
        }
      });
    }
    return InternalModuleFactory.createDynamicModule({
      exports: [ConfigService],
      global: true,
      imports: conditionalModules?.filter(({ when }) => result.data[when]).map(({ module }) => module) ?? [],
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_TOKEN,
          useValue: result.data
        },
        ConfigService
      ]
    });
  }
}

export { ConfigService } from './config.service.js';
