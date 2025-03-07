import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';

import { ConfigModule } from '../config/config.module.js';
import { ConfigService } from '../config/config.service.js';
import { CryptoService } from './crypto.service.js';

@Module({})
export class CryptoModule {
  static forRoot(): DynamicModule {
    return {
      exports: [CryptoService],
      global: true,
      imports: [ConfigModule],
      module: CryptoModule,
      providers: [
        {
          inject: [ConfigService],
          provide: CryptoService,
          useFactory: (configService: ConfigService) => {
            return new CryptoService({
              pbkdf2Params: {
                iterations: configService.get('DANGEROUSLY_DISABLE_PBKDF2_ITERATION') ? 1 : 100_000
              },
              secretKey: configService.getOrThrow('SECRET_KEY')
            });
          }
        }
      ]
    };
  }
}
