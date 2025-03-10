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

import type { PrismaModuleOptions } from '../modules/prisma/prisma.config.js';
import type { BaseEnv } from '../schemas/env.schema.js';

type ImportedModule = DynamicModule | Type<any>;

type ConditionalImport<TEnv extends BaseEnv = BaseEnv> = {
  module: ImportedModule;
  when: ConditionalKeys<TEnv, boolean | undefined>;
};

export type DynamicAppModule = DynamicModule & {
  module: typeof AppModule;
};

export type CreateAppModuleOptions<TEnv extends BaseEnv = BaseEnv> = {
  envConfig: TEnv;
  imports?: (ConditionalImport<TEnv> | ImportedModule)[];
  prisma: PrismaModuleOptions;
  providers?: Provider[];
};

export class AppModule implements NestModule {
  @Inject()
  private readonly configService: ConfigService;

  static create<TEnv extends BaseEnv>({
    envConfig,
    imports: imports_ = [],
    prisma,
    providers = []
  }: CreateAppModuleOptions<TEnv>): DynamicAppModule {
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
