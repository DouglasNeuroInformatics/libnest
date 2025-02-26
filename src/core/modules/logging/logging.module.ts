import { Module } from '@nestjs/common';
import type { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';

import { ConfigModule } from '../config/config.module.js';
import { ConfigService } from '../config/config.service.js';
import { JSONLogger } from './json.logger.js';
import { LOGGING_MODULE_OPTIONS_TOKEN } from './logging.config.js';
import { LoggingMiddleware } from './logging.middleware.js';
import { LoggingService } from './logging.service.js';

@Module({})
export class LoggingModule implements NestModule {
  static forRoot(): DynamicModule {
    return {
      exports: [JSONLogger, LoggingService],
      global: true,
      imports: [ConfigModule],
      module: LoggingModule,
      providers: [
        {
          inject: [ConfigService],
          provide: LOGGING_MODULE_OPTIONS_TOKEN,
          useFactory: (configService: ConfigService) => {
            return {
              debug: configService.get('DEBUG'),
              log: configService.get('NODE_ENV') !== 'test',
              verbose: configService.get('VERBOSE')
            };
          }
        },
        JSONLogger,
        LoggingService
      ]
    };
  }
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
