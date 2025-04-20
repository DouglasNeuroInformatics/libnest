import { VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

import { DocsFactory } from '../docs/docs.factory.js';

import type { AppVersion, DocsConfig } from '../docs/docs.factory.js';

export async function configureApp(
  app: NestExpressApplication,
  options: {
    docs?: Omit<DocsConfig, 'version'>;
    version?: AppVersion;
  } = {}
): Promise<NestExpressApplication> {
  if (options.docs) {
    await DocsFactory.configureDocs(app, { ...options.docs, version: options.version });
  }

  app.enableCors();
  app.enableShutdownHooks();
  if (options.version) {
    app.enableVersioning({
      defaultVersion: options.version,
      type: VersioningType.URI
    });
  }
  app.use(json({ limit: '50MB' }));

  return app;
}
