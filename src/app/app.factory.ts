import type { MiddlewareConsumer, Provider, Type } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import type { Simplify } from 'type-fest';
import type { z } from 'zod/v4';

import { GlobalExceptionFilter } from '../filters/global-exception.filter.js';
import { JSX_OPTIONS_TOKEN } from '../interceptors/render.interceptor.js';
import { ConfigModule } from '../modules/config/config.module.js';
import { CryptoModule } from '../modules/crypto/crypto.module.js';
import { JSXModule } from '../modules/jsx/jsx.module.js';
import { LoggingModule } from '../modules/logging/logging.module.js';
import { PrismaModule } from '../modules/prisma/prisma.module.js';
import { ValidationPipe } from '../pipes/validation.pipe.js';
import { parseEnv } from '../utils/env.utils.js';
import { CONFIGURE_USER_MIDDLEWARE_TOKEN, LIBNEST_STATIC_TOKEN } from './app.base.js';
import { AppContainer } from './app.container.js';
import { AppModule } from './app.module.js';

import type { JSXOptions } from '../interceptors/render.interceptor.js';
import type { DefaultPrismaClientOptions, PrismaModuleOptions } from '../modules/prisma/prisma.config.js';
import type { LibnestExtendedPrismaClient } from '../modules/prisma/prisma.extensions.js';
import type { RuntimeEnv } from '../user-types.js';
import type { BaseEnvSchema } from '../utils/env.utils.js';
import type { AppContainerParams, ConditionalImport, DynamicAppModule, ImportedModule } from './app.base.js';

export type CreateAppOptions<
  TEnvSchema extends BaseEnvSchema = BaseEnvSchema,
  TPrismaClientOptions extends DefaultPrismaClientOptions = DefaultPrismaClientOptions,
  TExtendedPrismaClient extends LibnestExtendedPrismaClient = LibnestExtendedPrismaClient
> = Simplify<
  Omit<AppContainerParams, 'envConfig' | 'module'> & {
    configureMiddleware?: (consumer: MiddlewareConsumer) => void;
    controllers?: Type<any>[];
    envSchema: TEnvSchema;
    imports?: (ConditionalImport<z.output<TEnvSchema>> | ImportedModule)[];
    jsx?: JSXOptions;
    prisma: PrismaModuleOptions<TPrismaClientOptions, TExtendedPrismaClient>;
    providers?: Provider[];
  }
>;

export class AppFactory {
  static create<
    TEnvSchema extends BaseEnvSchema,
    TPrismaClientOptions extends DefaultPrismaClientOptions,
    TExtendedPrismaClient extends LibnestExtendedPrismaClient
  >({
    docs,
    envSchema,
    version,
    ...options
  }: CreateAppOptions<TEnvSchema, TPrismaClientOptions, TExtendedPrismaClient>): AppContainer<
    z.output<TEnvSchema>,
    TPrismaClientOptions,
    TExtendedPrismaClient
  > {
    const envConfig = parseEnv(envSchema);
    const module = this.createModule({ envConfig, ...options });
    return new AppContainer({ docs, envConfig, module, version });
  }

  static createModule({
    configureMiddleware,
    controllers,
    envConfig,
    imports: userImports = [],
    jsx,
    prisma,
    providers: userProviders = []
  }: Simplify<
    Pick<CreateAppOptions, 'configureMiddleware' | 'controllers' | 'imports' | 'jsx' | 'prisma' | 'providers'> & {
      envConfig: RuntimeEnv;
    }
  >): DynamicAppModule {
    const coreImports: ImportedModule[] = [
      ConfigModule.forRoot({ envConfig }),
      CryptoModule,
      LoggingModule,
      PrismaModule.forRoot(prisma)
    ];
    const coreProviders: Provider[] = [
      {
        provide: APP_FILTER,
        useClass: GlobalExceptionFilter
      },
      {
        provide: APP_PIPE,
        useClass: ValidationPipe
      },
      {
        provide: LIBNEST_STATIC_TOKEN,
        useValue: __LIBNEST_STATIC
      }
    ];

    if (configureMiddleware) {
      coreProviders.push({
        provide: CONFIGURE_USER_MIDDLEWARE_TOKEN,
        useValue: configureMiddleware
      });
    }
    if (jsx) {
      coreProviders.push({
        provide: JSX_OPTIONS_TOKEN,
        useValue: jsx
      });
    }

    if (jsx) {
      coreImports.push(JSXModule);
    }

    if (envConfig.THROTTLER_ENABLED) {
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
