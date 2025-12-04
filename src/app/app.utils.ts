import { VersioningType } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { DocsFactory } from '../docs/docs.factory.js';

import type { AppVersion, DocsConfig } from '../docs/docs.factory.js';

export async function configureApp(
  app: NestFastifyApplication,
  options: {
    docs?: Omit<DocsConfig, 'version'>;
    version?: AppVersion | null;
  } = {}
): Promise<NestFastifyApplication> {
  if (options.docs) {
    await DocsFactory.configureDocs(app, { ...options.docs, version: options.version });
  }

  app.enableCors({
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*'
  });
  app.enableShutdownHooks();
  if (options.version) {
    app.enableVersioning({
      defaultVersion: options.version,
      type: VersioningType.URI
    });
  }

  return app;
}
