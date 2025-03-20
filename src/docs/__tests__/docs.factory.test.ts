import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DocsFactory } from '../docs.factory.js';

const NestSwaggerModule = vi.hoisted(() => ({
  DocumentBuilder: vi.fn(function (this: object) {
    Object.setPrototypeOf(this, NestSwaggerModule.DocumentBuilderPrototype);
  }),
  DocumentBuilderPrototype: Object.freeze({
    addTag: vi.fn().mockReturnThis(),
    build: vi.fn(),
    setContact: vi.fn().mockReturnThis(),
    setDescription: vi.fn().mockReturnThis(),
    setExternalDoc: vi.fn().mockReturnThis(),
    setLicense: vi.fn().mockReturnThis(),
    setTitle: vi.fn().mockReturnThis(),
    setVersion: vi.fn().mockReturnThis()
  }),
  SwaggerModule: {
    createDocument: vi.fn()
  }
}));

type MockDocumentBuilderInstance = typeof NestSwaggerModule.DocumentBuilderPrototype;

vi.mock('@nestjs/swagger', () => NestSwaggerModule);

describe('DocsFactory', () => {
  const { DocumentBuilder, SwaggerModule } = NestSwaggerModule;

  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      getHttpAdapter: vi.fn().mockImplementation(() => ({
        getInstance: vi.fn().mockImplementation(() => ({
          get: vi.fn()
        }))
      })),
      useStaticAssets: vi.fn()
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should set all provided configuration options', async () => {
    await DocsFactory.configureDocs(mockApp, {
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
      path: '/',
      tags: ['tag1', 'tag2'],
      title: 'Test API',
      version: '1'
    });

    expect(DocumentBuilder).toHaveBeenCalledOnce();

    const documentBuilder: MockDocumentBuilderInstance = DocumentBuilder.mock.instances[0]!;
    expect(documentBuilder.setTitle).toHaveBeenCalledWith('Test API');
    expect(documentBuilder.setContact).toHaveBeenCalledWith('John Doe', 'https://example.com', 'john.doe@example.com');
    expect(documentBuilder.setDescription).toHaveBeenCalledWith('This is a test API');
    expect(documentBuilder.setLicense).toHaveBeenCalledWith('MIT', 'https://opensource.org/license/MIT');
    expect(documentBuilder.setVersion).toHaveBeenCalledWith('1');
    expect(documentBuilder.setExternalDoc).toHaveBeenCalledWith('Find more info here', 'https://example.com/docs');
    expect(documentBuilder.addTag).toHaveBeenCalledWith('tag1');
    expect(documentBuilder.addTag).toHaveBeenCalledWith('tag2');
  });

  it('should create the document using the SwaggerModule', async () => {
    NestSwaggerModule.DocumentBuilderPrototype.build.mockReturnValueOnce('BUILD_RESULT');
    await DocsFactory.configureDocs(mockApp, {
      path: '/',
      title: 'Test API'
    });
    expect(SwaggerModule.createDocument).toHaveBeenLastCalledWith(mockApp, 'BUILD_RESULT');
  });
});
