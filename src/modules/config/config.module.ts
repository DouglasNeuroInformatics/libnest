import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';

import { ConfigService } from '../../index.js';

import type { UserTypes } from '../../user-config.js';

@Module({})
export class ConfigModule {
  static forRoot({ envConfig }: { envConfig: UserTypes.Env }): DynamicModule {
    return {
      exports: [ConfigService],
      global: true,
      module: ConfigModule,
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService(envConfig)
        }
      ]
    };
  }
}
