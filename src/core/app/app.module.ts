import { Inject } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { LoggingMiddleware } from '../logging/logging.middleware.js';
import { delay } from '../middleware/delay.middleware.js';
import { ConfigService } from '../services/config.service.js';

export class AppModule implements NestModule {
  @Inject()
  private readonly configService: ConfigService;

  configure(consumer: MiddlewareConsumer) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const responseDelay = this.configService.get('API_RESPONSE_DELAY');
    consumer.apply(LoggingMiddleware).forRoutes('*');
    if (!isProd && responseDelay) {
      consumer.apply(delay({ responseDelay })).forRoutes('*');
    }
  }
}
