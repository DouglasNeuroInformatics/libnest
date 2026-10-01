import { Controller, Get } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DocsFactory } from '../docs.factory.js';

import type { DocsConfig } from '../docs.factory.js';

@Controller('cats')
class CatsController {
  @Get()
  find() {
    return [];
  }
}

describe('DocsFactory', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [CatsController] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter(), { logger: false });
  });

  afterEach(async () => {
    await app.close();
  });

  const configureDocs = async (config: DocsConfig) => {
    await DocsFactory.configureDocs(app, config);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  };

  it('should serve the docs page and the spec', async () => {
    await configureDocs({ path: '/docs', title: 'Test API' });

    const page = await app.inject({ method: 'GET', url: '/docs' });
    expect(page.statusCode).toBe(200);
    expect(page.headers['content-type']).toMatch(/^text\/html/);
    expect(page.body).toContain('<title>Test API</title>');
    expect(page.body).toContain('<redoc spec-url="/docs/spec.json"></redoc>');
    expect(page.body).toContain('https://cdn.redoc.ly/redoc/v2.5.4/bundles/redoc.standalone.js');

    const spec = await app.inject({ method: 'GET', url: '/docs/spec.json' });
    expect(spec.json()).toEqual({
      components: { schemas: {} },
      info: { title: 'Test API', version: '1.0.0' },
      openapi: '3.1.0',
      paths: {
        '/cats': {
          get: {
            operationId: 'CatsController_find',
            responses: { 200: { description: 'OK' } },
            tags: ['Cats']
          }
        }
      }
    });
  });

  it('should serve the spec relative to a path ending with a slash', async () => {
    await configureDocs({ path: '/', title: 'Test API' });
    const page = await app.inject({ method: 'GET', url: '/' });
    expect(page.body).toContain('<redoc spec-url="/spec.json"></redoc>');
    const spec = await app.inject({ method: 'GET', url: '/spec.json' });
    expect(spec.statusCode).toBe(200);
  });

  it('should set all provided configuration options', async () => {
    await configureDocs({
      contact: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        url: 'https://example.com'
      },
      description: 'This is a test API',
      externalDoc: {
        description: 'Find more info here',
        url: 'https://example.com/docs'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/license/MIT'
      },
      path: '/docs',
      tags: ['tag1', 'tag2'],
      title: 'Test API',
      version: '1'
    });
    const spec = await app.inject({ method: 'GET', url: '/docs/spec.json' });
    expect(spec.json()).toMatchObject({
      externalDocs: {
        description: 'Find more info here',
        url: 'https://example.com/docs'
      },
      info: {
        contact: {
          email: 'john.doe@example.com',
          name: 'John Doe',
          url: 'https://example.com'
        },
        description: 'This is a test API',
        license: {
          name: 'MIT',
          url: 'https://opensource.org/license/MIT'
        },
        title: 'Test API',
        version: '1'
      },
      tags: [{ name: 'tag1' }, { name: 'tag2' }]
    });
  });
});
