import { Global, Module } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { ConfigService } from '../config/config.service.js';
import { JSONLogger } from './json.logger.js';
import { LOGGING_MODULE_OPTIONS_TOKEN } from './logging.config.js';
import { LoggingMiddleware } from './logging.middleware.js';
import { LoggingService } from './logging.service.js';

import type { LoggingOptions } from './logging.config.js';

@Global()
@Module({
  exports: [JSONLogger, LoggingService],
  providers: [
    {
      inject: [ConfigService],
      provide: LOGGING_MODULE_OPTIONS_TOKEN,
      useFactory: (configService: ConfigService): LoggingOptions => {
        return {
          debug: configService.get('DEBUG'),
          log: configService.get('LOG') ?? configService.get('NODE_ENV') !== 'test',
          verbose: configService.get('VERBOSE')
        };
      }
    },
    JSONLogger,
    LoggingService
  ]
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
