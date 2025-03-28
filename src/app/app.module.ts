import { Inject } from '@nestjs/common';
import type { MiddlewareConsumer, NestModule } from '@nestjs/common';

import { delay } from '../middleware/delay.middleware.js';
import { ConfigService } from '../modules/config/config.service.js';

export class AppModule implements NestModule {
  @Inject()
  private readonly configService: ConfigService;

  configure(consumer: MiddlewareConsumer): void {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const responseDelay = this.configService.get('API_RESPONSE_DELAY');
    if (!isProd && responseDelay) {
      consumer.apply(delay({ responseDelay })).forRoutes('*');
    }
  }
}
