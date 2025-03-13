import { ValidationException } from '@douglasneuroinformatics/libjs';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { $BaseEnv } from '../../schemas/env.schema.js';
import { AppContainer } from '../app.container.js';

import type { BaseEnv } from '../../schemas/env.schema.js';
import type { MockedInstance } from '../../testing/index.js';
import type { CreateAppContainerOptions } from '../app.container.js';

const env = {
  API_PORT: '5500',
  DEBUG: 'false',
  MONGO_URI: 'mongodb://localhost:27017',
  NODE_ENV: 'test',
  SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
  VERBOSE: 'false'
} satisfies { [K in keyof BaseEnv]?: string };

const createAppContainer = (options?: Partial<CreateAppContainerOptions>) => {
  return AppContainer.create({
    envSchema: $BaseEnv,
    prisma: {
      dbPrefix: null
    },
    version: '1',
    ...options
  });
};

describe('AppContainer', () => {
  describe('create', () => {
    beforeAll(() => {
      Object.entries(env).forEach(([key, value]) => {
        vi.stubEnv(key, value);
      });
    });

    it('should throw an error if it cannot parse the schema', async () => {
      vi.stubEnv('VERBOSE', '1');
      await expect(() => createAppContainer()).rejects.toThrow(
        expect.objectContaining({
          cause: expect.any(ValidationException),
          message: 'Failed to parse environment config'
        })
      );
      vi.stubEnv('VERBOSE', env.VERBOSE);
    });
  });

  describe('bootstrap', () => {
    let mockApp: MockedInstance<NestExpressApplication>;

    beforeEach(() => {
      mockApp = {
        enableCors: vi.fn(),
        enableShutdownHooks: vi.fn(),
        enableVersioning: vi.fn(),
        get: vi.fn(),
        getUrl: vi.fn(),
        listen: vi.fn(),
        use: vi.fn(),
        useLogger: vi.fn()
      } as MockedInstance<NestExpressApplication>;
      vi.spyOn(NestFactory, 'create').mockReturnValue(mockApp as any);
    });

    it('should listen on the port and log the url', async () => {
      const appContainer = await createAppContainer();
      const mockLogger = { log: vi.fn() };
      const mockUrl = 'http://localhost:5500';
      mockApp.get.mockReturnValueOnce(mockLogger);
      mockApp.getUrl.mockReturnValueOnce(mockUrl);
      await appContainer.bootstrap();
      expect(mockApp.listen).toHaveBeenCalledExactlyOnceWith(5500);
      expect(mockLogger.log).toHaveBeenCalledExactlyOnceWith(`Application is running on: ${mockUrl}`);
    });
  });
});
