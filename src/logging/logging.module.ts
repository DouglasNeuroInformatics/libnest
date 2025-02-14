import { Module } from '@nestjs/common';
import type { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';

import { LOGGING_OPTIONS_TOKEN } from './logging.config.js';
import { LoggingMiddleware } from './logging.middleware.js';
import { LoggingService } from './logging.service.js';

import type { LoggingOptions } from './logging.config.js';

@Module({})
export class LoggingModule implements NestModule {
  static forRoot(options: LoggingOptions): DynamicModule {
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
