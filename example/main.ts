import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { DocsFactory } from '../src/docs/docs.factory.js';
import { ConfigService } from '../src/index.js';
import { JSONLogger } from '../src/modules/logging/json.logger.js';
import { AppModule } from './app.module.js';

export default async function main(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  });
  await DocsFactory.configureDocs(app, {
    path: '/docs',
    title: 'Example API'
  });
  app.enableCors();
  app.enableShutdownHooks();
  // app.enableVersioning({
  //   defaultVersion: options.version,
  //   type: VersioningType.URI
  // });

  const configService = app.get(ConfigService);
  const logger = app.get(JSONLogger);
  app.useLogger(logger);

  app.use(json({ limit: '50MB' }));

  await app.listen(configService.get('API_PORT'));
  const url = await app.getUrl();
  logger.log(`Application is running on: ${url}`);
}
