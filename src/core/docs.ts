import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export type DocsOptions = {
  config: {
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
    tags?: string[];
    title: string;
    version?: number | string;
  };
  path: `/${string}.json`;
};

export function setupDocs(
  app: NestExpressApplication,
  { config: { contact, description, externalDoc, license, tags, title, version }, path }: DocsOptions
) {
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

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter.get(path, (_, res) => {
    res.send(document);
  });
}
