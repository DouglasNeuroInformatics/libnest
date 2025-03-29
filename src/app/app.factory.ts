import type { Provider } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import type { Prisma } from '@prisma/client';
import type { Simplify } from 'type-fest';
import type { z } from 'zod';

import { GlobalExceptionFilter } from '../filters/global-exception.filter.js';
import { ConfigModule } from '../modules/config/config.module.js';
import { CryptoModule } from '../modules/crypto/crypto.module.js';
import { LoggingModule } from '../modules/logging/logging.module.js';
import { PrismaModule } from '../modules/prisma/prisma.module.js';
import { ValidationPipe } from '../pipes/validation.pipe.js';
import { parseEnv } from '../utils/env.utils.js';
import { AppContainer } from './app.container.js';
import { AppModule } from './app.module.js';

import type { PrismaModuleOptions } from '../modules/prisma/prisma.config.js';
import type { BaseEnvSchema } from '../utils/env.utils.js';
import type { ConditionalImport, ImportedModule } from './app.base.js';
import type { AppContainerParams } from './app.container.js';

export type CreateAppOptions<
  TEnvSchema extends BaseEnvSchema = BaseEnvSchema,
  TPrismaClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions
> = Simplify<
  Omit<AppContainerParams, 'envConfig' | 'module'> & {
    envSchema: TEnvSchema;
    imports?: (ConditionalImport<z.TypeOf<TEnvSchema>> | ImportedModule)[];
    prisma: PrismaModuleOptions<TPrismaClientOptions>;
    providers?: Provider[];
  }
>;

export class AppFactory {
  static create<TEnvSchema extends BaseEnvSchema, TPrismaClientOptions extends Prisma.PrismaClientOptions>({
    docs,
    envSchema,
    imports: imports_ = [],
    prisma,
    providers = [],
    version
  }: CreateAppOptions<TEnvSchema, TPrismaClientOptions>): AppContainer<z.TypeOf<TEnvSchema>, TPrismaClientOptions> {
    const envConfig = parseEnv(envSchema);
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
      }
    ];

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

    const imports: ImportedModule[] = [];
    for (const import_ of imports_ as { [key: string]: any }[]) {
      if (import_.module && typeof import_.when === 'string') {
        if (envConfig[import_.when as keyof typeof envConfig]) {
          imports.push(import_.module as ImportedModule);
        }
      } else {
        imports.push(import_ as ImportedModule);
      }
    }

    const module = {
      imports: [...coreImports, ...imports],
      module: AppModule,
      providers: [...coreProviders, ...providers]
    };

    return new AppContainer({ docs, envConfig, module, version });
  }
}
