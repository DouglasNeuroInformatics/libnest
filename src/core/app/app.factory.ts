import { filterObject } from '@douglasneuroinformatics/libjs';
import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { JSONLogger } from '../logging/json.logger.js';
import { AppModuleFactory } from './app.module.factory.js';
import { DocsFactory } from './docs.factory.js';

import type { RuntimeEnv } from '../../config/schema.js';
import type { ConfigSchema, CreateAppOptions } from './app.types.js';

export class AppFactory {
  static async createApp({ callback, docs, imports = [], providers = [], schema, version }: CreateAppOptions) {
    const config = await this.parseConfig(schema);
    const app = await NestFactory.create<NestExpressApplication>(
      AppModuleFactory.create({
        config,
        imports,
        providers
      }),
      {
        bufferLogs: true
      }
    );
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

    return callback(app, config, logger);
  }

  private static async parseConfig(schema: ConfigSchema): Promise<RuntimeEnv> {
    const input = filterObject(process.env, (value) => value !== '');
    const result = await schema.safeParseAsync(input);
    if (!result.success) {
      throw new Error('Failed to Parse Environment Variables', {
        cause: {
          issues: result.error.issues
        }
      });
    }
    return result.data;
  }
}

export type { CreateAppOptions };
