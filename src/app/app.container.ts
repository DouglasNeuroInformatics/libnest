import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { JSONLogger } from '../modules/logging/json.logger.js';
import { AbstractAppContainer } from './app.base.js';
import { configureApp } from './app.utils.js';

import type { AppContainerParams } from './app.base.js';

export class AppContainer extends AbstractAppContainer {
  constructor(params: AppContainerParams) {
    super(params);
  }

  async bootstrap(): Promise<void> {
    const app = await this.createApplicationInstance();
    const logger = app.get(JSONLogger);

    // configure logger here, so in tests we can setup differently
    app.useLogger(logger);

    await app.listen(this.envConfig.API_PORT, '0.0.0.0');
    const url = await app.getUrl();
    logger.log(`Application is running on: ${url}`);
  }

  async createApplicationInstance(): Promise<NestFastifyApplication> {
    const app = await NestFactory.create<NestFastifyApplication>(
      this.module,
      new FastifyAdapter({ bodyLimit: 1024 * 1024 * 50 }),
      { bufferLogs: true, rawBody: true }
    );
    return configureApp(app, {
      docs: this.docs,
      version: this.version
    });
  }
}
