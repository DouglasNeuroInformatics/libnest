import { Inject } from '@nestjs/common';
import type { DynamicModule, MiddlewareConsumer, ModuleMetadata, NestModule, Provider } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { GlobalExceptionFilter } from '../filters/global-exception.filter.js';
import { delay } from '../middleware/delay.middleware.js';
import { ConfigModule } from '../modules/config/config.module.js';
import { ConfigService } from '../modules/config/config.service.js';
import { CryptoModule } from '../modules/crypto/crypto.module.js';
import { LoggingModule } from '../modules/logging/logging.module.js';
import { ValidationPipe } from '../pipes/validation.pipe.js';

import type { RuntimeEnv } from '../../config/schema.js';

export type ImportedModule = NonNullable<ModuleMetadata['imports']>[number];

export type DynamicAppModule = DynamicModule & {
  module: typeof AppModule;
};

export type CreateAppModuleOptions = {
  config: RuntimeEnv;
  imports?: ImportedModule[];
  providers?: Provider[];
};

export class AppModule implements NestModule {
  @Inject()
  private readonly configService: ConfigService;

  static create({ config, imports = [], providers = [] }: CreateAppModuleOptions): DynamicAppModule {
    const coreImports: ImportedModule[] = [
      ConfigModule.forRoot({ config }),
      CryptoModule.forRoot(),
      LoggingModule.forRoot()
    ];
    const coreProviders: Provider[] = [
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

  configure(consumer: MiddlewareConsumer) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const responseDelay = this.configService.get('API_RESPONSE_DELAY');
    if (!isProd && responseDelay) {
      consumer.apply(delay({ responseDelay })).forRoutes('*');
    }
  }
}
