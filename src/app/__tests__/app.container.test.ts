import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { DocsFactory } from '../../docs/docs.factory.js';
import { JSONLogger } from '../../modules/logging/json.logger.js';
import { AppContainer } from '../app.container.js';

import type { MockedInstance } from '../../testing/index.js';

describe('AppContainer', () => {
  let mockApp: MockedInstance<NestFastifyApplication>;
  let mockLogger: MockedInstance<JSONLogger>;

  beforeAll(() => {
    mockLogger = {
      log: vi.fn()
    } as MockedInstance<JSONLogger>;

    mockApp = {
      enableCors: vi.fn(),
      enableShutdownHooks: vi.fn(),
      enableVersioning: vi.fn(),
      get: vi.fn().mockReturnValue(mockLogger),
      getUrl: vi.fn().mockResolvedValue('http://localhost:3000'),
      listen: vi.fn(),
      useLogger: vi.fn()
    } as MockedInstance<NestFastifyApplication>;
    vi.spyOn(NestFactory, 'create').mockResolvedValue(mockApp as any);
  });

  describe('createApplicationInstance', () => {
    it('should create and configure the application instance with correct settings', async () => {
      const appContainer = new AppContainer({
        envConfig: { API_PORT: 3000 } as any,
        module: {} as any,
        version: '1' as const
      });

      const app = await appContainer.createApplicationInstance();

      expect(app).toBe(mockApp);
      expect(mockApp.enableCors).toHaveBeenCalled();
      expect(mockApp.enableShutdownHooks).toHaveBeenCalled();
      expect(mockApp.enableVersioning).toHaveBeenCalledWith({
        defaultVersion: '1',
        type: VersioningType.URI
      });
    });

    it('should configure docs when provided', async () => {
      const mockDocsFactory = {
        configureDocs: vi.fn()
      };
      vi.spyOn(DocsFactory, 'configureDocs').mockImplementation(mockDocsFactory.configureDocs);

      const appContainer = new AppContainer({
        docs: {
          description: 'Test Description',
          path: '/docs',
          title: 'Test API'
        },
        envConfig: { API_PORT: 3000 } as any,
        module: {} as any,
        version: '1'
      });

      await appContainer.createApplicationInstance();

      expect(mockDocsFactory.configureDocs).toHaveBeenCalledWith(mockApp, {
        description: 'Test Description',
        path: '/docs',
        title: 'Test API',
        version: '1'
      });
    });
  });

  describe('bootstrap', () => {
    it('should bootstrap the application with correct configuration', async () => {
      const appContainer = new AppContainer({
        envConfig: { API_PORT: 3000 } as any,
        module: {} as any,
        version: '1' as const
      });

      await appContainer.bootstrap();

      expect(mockApp.useLogger).toHaveBeenCalledWith(mockLogger);
      expect(mockApp.listen).toHaveBeenCalledWith(3000);
      expect(mockLogger.log).toHaveBeenCalledWith('Application is running on: http://localhost:3000');
    });
  });
});
