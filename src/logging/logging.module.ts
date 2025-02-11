import { Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { LOGGING_OPTIONS_TOKEN } from './logging.config.js';
import { LoggingMiddleware } from './logging.middleware.js';
import { LoggingService } from './logging.service.js';

import type { InternalDynamicModule } from '../core/factories/internal-module.factory.js';
import type { LoggingOptions } from './logging.config.js';

@Module({})
export class LoggingModule implements NestModule {
  static forRoot(options: LoggingOptions): InternalDynamicModule {
    return {
      exports: [LoggingService],
      module: LoggingModule,
      providers: [
        {
          provide: LOGGING_OPTIONS_TOKEN,
          useValue: options
        },
        LoggingService
      ]
    };
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
