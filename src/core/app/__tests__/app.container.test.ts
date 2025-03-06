import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { mockEnvConfig } from '../../../testing/mocks/env-config.mock.js';
import { JSONLogger } from '../../modules/logging/json.logger.js';
import { AppContainer } from '../app.container.js';

import type { MockedInstance } from '../../../testing/index.js';

describe('AppContainer', () => {
  let appContainer: AppContainer;
  let appModule: Mock;
  let mockApp: MockedInstance<NestExpressApplication>;

  beforeEach(() => {
    mockApp = {
      enableCors: vi.fn(),
      enableShutdownHooks: vi.fn(),
      enableVersioning: vi.fn(),
      get: vi.fn((typeOrToken: any) => {
        if (typeOrToken === JSONLogger) {
          return {
            log: vi.fn()
          };
        }
        return;
      }),
      getUrl: vi.fn(),
      listen: vi.fn(),
      use: vi.fn(),
      useLogger: vi.fn()
    } as MockedInstance<NestExpressApplication>;
    vi.spyOn(NestFactory, 'create').mockReturnValue(mockApp as any);
    appModule = vi.fn().mockReturnThis();
    appContainer = new AppContainer({
      envConfig: {
        ...mockEnvConfig
      },
      module: appModule as any,
      version: '1'
    });
  });

  describe('bootstrap', () => {
    it('should listen on the specified port', async () => {
      await appContainer.bootstrap();
      expect(mockApp.listen).toHaveBeenCalled();
    });
  });

  describe('createNestApplication', () => {
    it('should return the app', async () => {
      const app = await appContainer.createNestApplication();
      expect(app).toBe(mockApp);
    });
  });
});
