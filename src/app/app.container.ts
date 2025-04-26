import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { JSONLogger } from '../modules/logging/json.logger.js';
import { AbstractAppContainer } from './app.base.js';
import { configureApp } from './app.utils.js';

import type { DefaultPrismaGlobalOmitConfig } from '../modules/prisma/prisma.config.js';
import type { BaseEnv } from '../schemas/env.schema.js';
import type { AppContainerParams } from './app.base.js';

export class AppContainer<
  TEnv extends BaseEnv,
  _TPrismaGlobalOmitConfig extends DefaultPrismaGlobalOmitConfig
> extends AbstractAppContainer<TEnv> {
  constructor(params: AppContainerParams<TEnv>) {
    super(params);
  }

  async bootstrap(): Promise<void> {
    const app = await this.createApplicationInstance();
    const logger = app.get(JSONLogger);

    // configure logger here, so in tests we can setup differently
    app.useLogger(logger);

    await app.listen(this.envConfig.API_PORT);
    const url = await app.getUrl();
    logger.log(`Application is running on: ${url}`);
  }

  async createApplicationInstance(): Promise<NestExpressApplication> {
    const app = await NestFactory.create<NestExpressApplication>(this.module, {
      bufferLogs: true
    });
    return configureApp(app, {
      docs: this.docs,
      version: this.version
    });
  }
}
