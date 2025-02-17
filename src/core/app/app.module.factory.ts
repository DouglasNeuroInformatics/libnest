import type { DynamicModule, Provider } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { GlobalExceptionFilter } from '../filters/global-exception.filter.js';
import { JSONLogger } from '../logging/json.logger.js';
import { LOGGING_OPTIONS_TOKEN } from '../logging/logging.config.js';
import { LoggingService } from '../logging/logging.service.js';
import { ValidationPipe } from '../pipes/validation.pipe.js';
import { ConfigService } from '../services/config.service.js';
import { CryptoService } from '../services/crypto.service.js';
import { AppModule } from './app.module.js';

import type { RuntimeEnv } from '../../config/schema.js';
import type { ImportedModule } from './app.types.js';

export type CreateAppModuleOptions = {
  config: RuntimeEnv;
  imports: ImportedModule[];
  providers: Provider[];
};

export class AppModuleFactory {
  static create({ config, imports, providers }: CreateAppModuleOptions): DynamicModule {
    const coreImports: ImportedModule[] = [];
    const coreProviders: Provider[] = [
      {
        provide: ConfigService,
        useValue: new ConfigService(config)
      },
      {
        provide: CryptoService,
        useValue: new CryptoService({
          pbkdf2Params: {
            iterations: config.DANGEROUSLY_DISABLE_PBKDF2_ITERATION ? 1 : 100_000
          },
          secretKey: config.SECRET_KEY
        })
      },
      {
        provide: LOGGING_OPTIONS_TOKEN,
        useValue: {
          debug: config.DEBUG,
          log: config.NODE_ENV !== 'test',
          verbose: config.VERBOSE
        }
      },
      JSONLogger,
      LoggingService,
      {
        provide: APP_FILTER,
        useClass: GlobalExceptionFilter
      },
      {
        provide: APP_PIPE,
        useClass: ValidationPipe
      }
    ];

    if (config.THROTTLER_ENABLED) {
      coreImports.push(
        ThrottlerModule.forRoot([
          {
            limit: 25,
            name: 'short',
            ttl: 1000
          },
          {
            limit: 100,
            name: 'medium',
            ttl: 10000
          },
          {
            limit: 250,
            name: 'long',
            ttl: 60000
          }
        ])
      );
      coreProviders.push({
        provide: APP_GUARD,
        useClass: ThrottlerGuard
      });
    }

    return {
      imports: [...coreImports, ...imports],
      module: AppModule,
      providers: [...coreProviders, ...providers]
    };
  }
}
