import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { DocsGenerator } from './docs.generator.js';

import type { JsonSchema, OpenApiPaths } from './docs.generator.js';

export type AppVersion = `${number}`;

export type DocsConfig = {
  contact?: {
    email: string;
    name: string;
    url: string;
  };
  description?: string;
  externalDoc?: {
    description: string;
    url: string;
  };
  license?: {
    name: string;
    url: string;
  };
  path: `/${string}`;
  tags?: string[];
  title: string;
  version?: AppVersion | null;
};

export type OpenApiDocument = {
  components: { schemas: { [name: string]: JsonSchema } };
  externalDocs?: { description: string; url: string };
  info: {
    contact?: { email: string; name: string; url: string };
    description?: string;
    license?: { name: string; url: string };
    title: string;
    version: string;
  };
  openapi: '3.1.0';
  paths: OpenApiPaths;
  tags?: { name: string }[];
};

export class DocsFactory {
  static async configureDocs(app: NestFastifyApplication, config: DocsConfig): Promise<void> {
    const document = this.createDocument(app, config);
    const httpAdapter = app.getHttpAdapter().getInstance();
    const specUrl = config.path.endsWith('/') ? config.path + 'spec.json' : config.path + '/spec.json';
    httpAdapter.get(specUrl, (_, reply) => {
      reply.send(document);
    });
    let html = await fs.readFile(path.resolve(import.meta.dirname, 'assets/index.html'), 'utf-8');
    html = html.replace('{{TITLE}}', config.title);
    html = html.replace('{{SPEC_URL}}', specUrl);
    httpAdapter.get(config.path, (_, reply) => {
      reply.type('text/html');
      reply.send(html);
    });
  }

  private static createDocument(
    app: NestFastifyApplication,
    { contact, description, externalDoc, license, tags, title, version }: DocsConfig
  ): OpenApiDocument {
    const { components, paths } = new DocsGenerator(app).generate();
    return {
      components,
      externalDocs: externalDoc,
      info: { contact, description, license, title, version: version ?? '1.0.0' },
      openapi: '3.1.0',
      paths,
      tags: tags?.map((name) => ({ name }))
    };
  }
}
