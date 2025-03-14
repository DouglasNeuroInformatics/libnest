import { filterObject, RuntimeException, safeParse } from '@douglasneuroinformatics/libjs';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import type { Simplify } from 'type-fest';
import type { z } from 'zod';

import { JSONLogger } from '../modules/logging/json.logger.js';
import { AppModule } from './app.module.js';
import { DocsFactory } from './docs.factory.js';

import type { BaseEnv } from '../schemas/env.schema.js';
import type { CreateAppModuleOptions } from './app.module.js';
import type { AppVersion, DocsConfig } from './docs.factory.js';

type EnvSchema = z.ZodType<BaseEnv, z.ZodTypeDef, { [key: string]: string }>;

type InitAppContainerOptions = {
  docs?: {
    config: Omit<DocsConfig, 'version'>;
    path: `/${string}.json`;
  };
  envConfig: BaseEnv;
  version: AppVersion;
};

export type CreateAppContainerOptions<TEnvSchema extends EnvSchema = EnvSchema> = Simplify<
  Omit<CreateAppModuleOptions<z.TypeOf<TEnvSchema>>, 'envConfig'> &
    Pick<InitAppContainerOptions, 'docs' | 'version'> & {
      envSchema: TEnvSchema;
    }
>;

export class AppContainer {
  readonly #app: NestExpressApplication;
  readonly #port: number;

  private constructor(app: NestExpressApplication, { docs, envConfig, version }: InitAppContainerOptions) {
    const logger = app.get(JSONLogger);
    app.useLogger(logger);
    app.enableCors();
    app.enableShutdownHooks();
    app.enableVersioning({
      defaultVersion: version,
      type: VersioningType.URI
    });
    app.use(json({ limit: '50MB' }));
    if (docs) {
      const document = DocsFactory.createDocs(app, { ...docs.config, version });
      const httpAdapter = app.getHttpAdapter().getInstance();
      httpAdapter.get(docs.path, (_, res) => {
        res.send(document);
      });
    }
    this.#app = app;
    this.#port = envConfig.API_PORT;
  }

  static async create<TEnvSchema extends EnvSchema>({
    docs,
    envSchema,
    imports,
    prisma,
    providers,
    version
  }: CreateAppContainerOptions<TEnvSchema>) {
    const envConfigResult = safeParse(
      filterObject(process.env, (value) => value !== ''),
      envSchema
    );
    if (envConfigResult.isErr()) {
      throw new RuntimeException('Failed to parse environment config', {
        cause: envConfigResult.error
      });
    }
    const envConfig = envConfigResult.value;
    const module = AppModule.create({ envConfig, imports, prisma, providers });
    const app = await NestFactory.create<NestExpressApplication>(module, {
      bufferLogs: true
    });
    return new this(app, { docs, envConfig, version }) as AppContainer & {
      __inferredEnvSchema: TEnvSchema;
    };
  }

  async bootstrap() {
    const logger = this.#app.get(JSONLogger);
    await this.#app.listen(this.#port);
    const url = await this.#app.getUrl();
    logger.log(`Application is running on: ${url}`);
  }

  getApplicationInstance() {
    return this.#app;
  }
}
