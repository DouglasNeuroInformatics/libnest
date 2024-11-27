import { Module } from '@nestjs/common';
import type { DynamicModule, MiddlewareConsumer, NestModule, Provider } from '@nestjs/common';

import {
  ConfigurableLoggingModule,
  LOGGING_MODULE_ASYNC_OPTIONS_TYPE,
  LOGGING_MODULE_OPTIONS_TYPE
} from './logging.config.js';
import { LoggerMiddleware } from './logging.middleware.js';
import { LoggingService } from './logging.service.js';

@Module({})
export class LoggingModule extends ConfigurableLoggingModule implements NestModule {
  private static exports: Provider[] = [LoggingService];
  private static providers: Provider[] = [LoggingService];

  static forRoot(options: typeof LOGGING_MODULE_OPTIONS_TYPE): DynamicModule {
    return this.createModule(super.forRoot(options));
  }

  static forRootAsync(options: typeof LOGGING_MODULE_ASYNC_OPTIONS_TYPE): DynamicModule {
    return this.createModule(super.forRootAsync(options));
  }

  private static createModule(module: DynamicModule) {
    if (!module.exports) {
      module.exports = [...this.exports];
    } else {
      module.exports.push(...this.exports);
    }
    module.providers!.push(...this.providers);
    return module;
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export { JSONLogger } from './json.logger.js';
export type { LoggingModuleOptions } from './logging.config.js';
export { LoggingService } from './logging.service.js';
