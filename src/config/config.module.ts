import { Module } from '@nestjs/common';

import { type InternalDynamicModule, InternalModuleFactory } from '../core/factories/internal-module.factory.js';
import { ConfigService } from './config.service.js';
import { CONFIG_TOKEN } from './config.token.js';

import type { RuntimeConfig } from '../user-config.js';

export type ConfigModuleOptions = {
  config: RuntimeConfig;
};

@Module({})
export class ConfigModule {
  static forRoot({ config }: ConfigModuleOptions): InternalDynamicModule {
    return InternalModuleFactory.createDynamicModule({
      exports: [ConfigService],
      global: true,
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_TOKEN,
          useValue: config
        },
        ConfigService
      ]
    });
  }
}
