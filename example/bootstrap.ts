import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { JSONLogger } from '../src/logging/json.logger.js';
import { AppModule } from './app.module.js';

export default async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  });
  const logger = new JSONLogger(null);
  app.useLogger(logger);

  await app.listen(5500);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
