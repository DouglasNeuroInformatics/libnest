import { Module } from '@nestjs/common';
import type { DynamicModule, ModuleMetadata } from '@nestjs/common';
import type { ConditionalKeys } from 'type-fest';
import type { z } from 'zod';

import { ConfigService } from './config.service.js';
import { CONFIG_TOKEN } from './config.token.js';

import type { UserConfig } from '../types.js';

export type ConfigModuleOptions = {
  conditionalModules?: {
    module: Required<ModuleMetadata>['imports'][number];
    when: ConditionalKeys<UserConfig, boolean>;
  }[];
  schema: z.ZodType<UserConfig, z.ZodTypeDef, { [key: string]: string }>;
};

@Module({})
export class ConfigModule {
  static forRoot({ conditionalModules, schema }: ConfigModuleOptions): DynamicModule {
    const result = schema.safeParse(process.env);
    if (!result.success) {
      throw new Error('Failed to Parse Environment Variables', {
        cause: {
          issues: result.error.issues
        }
      });
    }
    return {
      exports: [ConfigService],
      global: true,
      imports: conditionalModules?.filter(({ when }) => result.data[when]).map(({ module }) => module),
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_TOKEN,
          useValue: result.data
        },
        ConfigService
      ]
    };
  }
}

export { ConfigService } from './config.service.js';
