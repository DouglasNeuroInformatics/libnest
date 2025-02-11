import { type DynamicModule, type ModuleMetadata, VersioningType } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';
import type { Promisable } from 'type-fest';
import type { z } from 'zod';

import { ConfigModule } from '../../config/config.module.js';
import { JSONLogger } from '../../logging/json.logger.js';
import { LoggingModule } from '../../logging/logging.module.js';
import { GlobalExceptionFilter } from '../filters/global-exception.filter.js';
import { ValidationPipe } from '../pipes/validation.pipe.js';
import { type DocsConfig, DocsFactory } from './docs.factory.js';

import type { LoggingOptions } from '../../logging/logging.config.js';
import type { RuntimeConfig } from '../../user-config.js';
import type { internalModuleTag } from './internal-module.factory.js';

type ConfigSchema = z.ZodType<RuntimeConfig, z.ZodTypeDef, { [key: string]: string }>;

type ImportedModule = NonNullable<ModuleMetadata['imports']>[number] & {
  [internalModuleTag]?: never;
};

type CreateAppOptions = {
  callback: (app: NestExpressApplication, config: RuntimeConfig) => Promisable<void>;
  docs?: {
    config: DocsConfig;
    path: `/${string}.json`;
  };
  modules: ImportedModule[];
  schema: ConfigSchema;
  version: `${number}`;
};

class AppModule {}

export class AppFactory {
  static async createApp({ callback, docs, modules, schema, version }: CreateAppOptions) {
    const config = await this.parseConfig(schema);
    const AppModule = this.createAppModule({ config, modules });
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true
    });

    const logger = new JSONLogger(null, this.getLoggingOptions(config));
    app.useLogger(logger);

    app.enableCors();
    app.enableShutdownHooks();
    app.enableVersioning({
      defaultVersion: version,
      type: VersioningType.URI
    });
    app.use(json({ limit: '50MB' }));

    if (docs) {
      const document = DocsFactory.createDocs(app, docs.config);
      const httpAdapter = app.getHttpAdapter().getInstance();
      httpAdapter.get(docs.path, (_, res) => {
        res.send(document);
      });
    }

    return callback(app, config);

    // const port = config.API_DEV_SERVER_PORT;
    // await app.listen(port);
    // // const url = await app.getUrl();
    // // logger.log(`Application is running on: ${url}`);

    // return app;
  }

  private static createAppModule({
    config,
    modules
  }: {
    config: RuntimeConfig;
    modules: ImportedModule[];
  }): DynamicModule {
    return {
      imports: [ConfigModule.forRoot({ config }), LoggingModule.forRoot(this.getLoggingOptions(config)), ...modules],
      module: AppModule,
      providers: [
        {
          provide: APP_FILTER,
          useClass: GlobalExceptionFilter
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe
        }
      ]
    };
  }

  private static getLoggingOptions(config: RuntimeConfig): LoggingOptions {
    return {
      debug: config.DEBUG,
      log: config.NODE_ENV !== 'test',
      verbose: config.VERBOSE
    };
  }

  private static async parseConfig(schema: ConfigSchema): Promise<RuntimeConfig> {
    const result = await schema.safeParseAsync(process.env);
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

export type { CreateAppOptions, ImportedModule };
