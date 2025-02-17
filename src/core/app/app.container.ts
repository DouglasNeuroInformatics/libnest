import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { JSONLogger } from '../logging/json.logger.js';
import { DocsFactory } from './docs.factory.js';

import type { RuntimeEnv } from '../../config/schema.js';
import type { CreateAppContainerOptions, DocsConfig, DynamicAppModule } from './app.types.js';

export class AppContainer {
  readonly #config: RuntimeEnv;
  readonly #docs?: {
    config: Omit<DocsConfig, 'version'>;
    path: `/${string}.json`;
  };
  readonly #module: DynamicAppModule;
  readonly #version: `${number}`;

  constructor({ config, docs, module, version }: CreateAppContainerOptions) {
    this.#config = config;
    this.#docs = docs;
    this.#module = module;
    this.#version = version;
  }

  async bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(this.#module, {
      bufferLogs: true
    });
    const logger = app.get(JSONLogger);
    app.useLogger(logger);

    app.enableCors();
    app.enableShutdownHooks();
    app.enableVersioning({
      defaultVersion: this.#version,
      type: VersioningType.URI
    });
    app.use(json({ limit: '50MB' }));

    if (this.#docs) {
      const document = DocsFactory.createDocs(app, { ...this.#docs.config, version: this.#version });
      const httpAdapter = app.getHttpAdapter().getInstance();
      httpAdapter.get(this.#docs.path, (_, res) => {
        res.send(document);
      });
    }

    const isProduction = this.#config.NODE_ENV === 'production';
    const port = this.#config[isProduction ? 'API_PROD_SERVER_PORT' : 'API_DEV_SERVER_PORT'];
    await app.listen(port);
    const url = await app.getUrl();
    logger.log(`Application is running on: ${url}`);
  }
}
