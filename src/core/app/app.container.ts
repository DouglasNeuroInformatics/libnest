import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { JSONLogger } from '../modules/logging/json.logger.js';
import { DocsFactory } from './docs.factory.js';

import type { BaseEnv } from '../../config/schema.js';
import type { DynamicAppModule } from './app.module.js';
import type { AppVersion, DocsConfig } from './docs.factory.js';

export type CreateAppContainerOptions = {
  docs?: {
    config: Omit<DocsConfig, 'version'>;
    path: `/${string}.json`;
  };
  envConfig: BaseEnv;
  module: DynamicAppModule;
  version: AppVersion;
};

export class AppContainer {
  readonly #docs?: {
    config: Omit<DocsConfig, 'version'>;
    path: `/${string}.json`;
  };
  readonly #envConfig: BaseEnv;
  readonly #module: DynamicAppModule;
  readonly #version: AppVersion;

  constructor({ docs, envConfig, module, version }: CreateAppContainerOptions) {
    this.#docs = docs;
    this.#envConfig = envConfig;
    this.#module = module;
    this.#version = version;
  }

  async bootstrap() {
    const app = await this.createNestApplication();
    const logger = app.get(JSONLogger);
    const port = this.#envConfig.API_PORT;
    await app.listen(port);
    const url = await app.getUrl();
    logger.log(`Application is running on: ${url}`);
  }

  async createNestApplication() {
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
    return app;
  }
}
