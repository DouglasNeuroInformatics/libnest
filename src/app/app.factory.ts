import type { MiddlewareConsumer, Provider, Type } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import type { Simplify } from 'type-fest';
import type { z } from 'zod/v4';

import { GlobalExceptionFilter } from '../filters/global-exception.filter.js';
import { ConfigModule } from '../modules/config/config.module.js';
import { CryptoModule } from '../modules/crypto/crypto.module.js';
import { LoggingModule } from '../modules/logging/logging.module.js';
import { ValidationPipe } from '../pipes/validation.pipe.js';
import { parseEnv } from '../utils/env.utils.js';
import { CONFIGURE_USER_MIDDLEWARE_TOKEN } from './app.base.js';
import { AppContainer } from './app.container.js';
import { AppModule } from './app.module.js';

import type { UserTypes } from '../user-config.js';
import type { AppContainerParams, ConditionalImport, DynamicAppModule, ImportedModule } from './app.base.js';

export type CreateAppOptions = Simplify<
  Omit<AppContainerParams, 'envConfig' | 'module'> & {
    configureMiddleware?: (consumer: MiddlewareConsumer) => void;
    controllers?: Type<any>[];
    envSchema: z.ZodType<UserTypes.Env>;
    imports?: (ConditionalImport | ImportedModule)[];
    providers?: Provider[];
    throttler?: ThrottlerModuleOptions;
  }
>;

export class AppFactory {
  static create({ docs, envSchema, version, ...options }: CreateAppOptions): AppContainer {
    const envConfig = parseEnv(envSchema);
    const module = this.createModule({ envConfig, ...options });
    return new AppContainer({ docs, envConfig, module, version });
  }

  static createModule({
    configureMiddleware,
    controllers,
    envConfig,
    imports: userImports = [],
    providers: userProviders = [],
    throttler = [
      {
        limit: 25,
        name: 'short',
        ttl: 1000
      },
      {
        limit: 100,
        name: 'medium',
        ttl: 10_000
      },
      {
        limit: 250,
        name: 'long',
        ttl: 60_000
      }
    ]
  }: Simplify<
    Pick<CreateAppOptions, 'configureMiddleware' | 'controllers' | 'imports' | 'providers' | 'throttler'> & {
      envConfig: UserTypes.Env;
    }
  >): DynamicAppModule {
    const coreImports: ImportedModule[] = [ConfigModule.forRoot({ envConfig }), CryptoModule, LoggingModule];
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

    if (configureMiddleware) {
      coreProviders.push({
        provide: CONFIGURE_USER_MIDDLEWARE_TOKEN,
        useValue: configureMiddleware
      });
    }

    if (envConfig.THROTTLER_ENABLED) {
      coreImports.push(ThrottlerModule.forRoot(throttler));
      coreProviders.push({
        provide: APP_GUARD,
        useClass: ThrottlerGuard
      });
    }

    const resolvedUserImports: ImportedModule[] = [];
    for (const userImport of userImports as { [key: string]: any }[]) {
      if (userImport.module && typeof userImport.when === 'string') {
        if (envConfig[userImport.when as keyof typeof envConfig]) {
          resolvedUserImports.push(userImport.module as ImportedModule);
        }
      } else {
        resolvedUserImports.push(userImport as ImportedModule);
      }
    }

    return {
      controllers,
      imports: [...coreImports, ...resolvedUserImports],
      module: AppModule,
      providers: [...coreProviders, ...userProviders]
    };
  }
}
