import { isObjectLike } from '@douglasneuroinformatics/libjs';
import { Inject } from '@nestjs/common';
import type { DynamicModule, MiddlewareConsumer, NestModule, Provider, Type } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import type { ConditionalKeys } from 'type-fest';

import { GlobalExceptionFilter } from '../filters/global-exception.filter.js';
import { delay } from '../middleware/delay.middleware.js';
import { ConfigModule } from '../modules/config/config.module.js';
import { ConfigService } from '../modules/config/config.service.js';
import { CryptoModule } from '../modules/crypto/crypto.module.js';
import { LoggingModule } from '../modules/logging/logging.module.js';
import { PrismaModule } from '../modules/prisma/prisma.module.js';
import { ValidationPipe } from '../pipes/validation.pipe.js';

import type { RuntimeEnv } from '../../config/schema.js';
import type { PrismaModuleOptions } from '../modules/prisma/prisma.config.js';

type ImportedModule = DynamicModule | Type<any>;

type ConditionalImport = {
  module: ImportedModule;
  when: ConditionalKeys<RuntimeEnv, boolean | undefined>;
};

const isConditionalImport = (value: { [key: string]: any }): value is ConditionalImport => {
  return isObjectLike(value.module) && typeof value.when === 'string';
};

type Import = ConditionalImport | ImportedModule;

export type DynamicAppModule = DynamicModule & {
  module: typeof AppModule;
};

export type CreateAppModuleOptions = {
  envConfig: RuntimeEnv;
  imports?: Import[];
  prisma: PrismaModuleOptions;
  providers?: Provider[];
};

export class AppModule implements NestModule {
  @Inject()
  private readonly configService: ConfigService;

  static create({ envConfig, imports = [], prisma, providers = [] }: CreateAppModuleOptions): DynamicAppModule {
    const coreImports: ImportedModule[] = [
      ConfigModule.forRoot({ envConfig }),
      CryptoModule.forRoot(),
      LoggingModule.forRoot(),
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

    return {
      imports: [
        ...coreImports,
        ...imports
          .map((value) => {
            if (!isConditionalImport(value)) {
              return value;
            } else if (envConfig[value.when]) {
              return value.module;
            }
            return null;
          })
          .filter((value) => value !== null)
      ],
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
