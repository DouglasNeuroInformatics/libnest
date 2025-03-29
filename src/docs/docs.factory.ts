import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

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
  path: `${string}/`;
  tags?: string[];
  title: string;
  version?: AppVersion;
};

export class DocsFactory {
  static async configureDocs(app: NestExpressApplication, config: DocsConfig): Promise<void> {
    const document = this.createDocs(app, config);
    const httpAdapter = app.getHttpAdapter().getInstance();
    httpAdapter.get(config.path + 'spec.json', (_, res) => {
      res.send(document);
    });
    let html = await fs.readFile(path.resolve(import.meta.dirname, 'assets/index.html'), 'utf-8');
    html = html.replace('{{TITLE}}', config.title);
    httpAdapter.get(config.path, (_, res) => {
      res.set('Content-Type', 'text/html');
      res.send(html);
    });
  }

  private static createDocs(
    app: NestExpressApplication,
    { contact, description, externalDoc, license, tags, title, version }: DocsConfig
  ): OpenAPIObject {
    const documentBuilder = new DocumentBuilder();
    documentBuilder.setTitle(title);

    if (contact) {
      documentBuilder.setContact(contact.name, contact.url, contact.email);
    }
    if (description) {
      documentBuilder.setDescription(description);
    }
    if (license) {
      documentBuilder.setLicense(license.name, license.url);
    }
    if (version) {
      documentBuilder.setVersion(version.toString());
    }
    if (externalDoc) {
      documentBuilder.setExternalDoc(externalDoc.description, externalDoc.url);
    }
    if (tags?.length) {
      tags.forEach((tag) => documentBuilder.addTag(tag));
    }
    return SwaggerModule.createDocument(app, documentBuilder.build());
  }
}
