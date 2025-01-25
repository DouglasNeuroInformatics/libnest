import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import type { z } from 'zod';

import { ConfigService } from './config.service.js';
import { CONFIG_TOKEN } from './config.token.js';

import type { UserConfig } from '../types.js';

export type ConfigModuleOptions = {
  schema: z.ZodType<UserConfig, z.ZodTypeDef, { [key: string]: string }>;
};

@Module({})
export class ConfigModule {
  static forRoot(options: ConfigModuleOptions): DynamicModule {
    return {
      exports: [ConfigService],
      global: true,
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_TOKEN,
          useFactory: async () => {
            const result = await options.schema.safeParseAsync(process.env);
            if (result.success) {
              return result.data;
            }
            throw new Error('Failed to Parse Environment Variables', {
              cause: {
                issues: result.error.issues
              }
            });
          }
        },
        ConfigService
      ]
    };
  }
}

export { ConfigService } from './config.service.js';
