import { ValidationException } from '@douglasneuroinformatics/libjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { $BaseEnv } from '../../../config/schema.js';
import { AppFactory } from '../app.factory.js';

import type { BaseEnv } from '../../../config/schema.js';
import type { CreateAppOptions } from '../app.factory.js';

const env = {
  API_DEV_SERVER_PORT: '5500',
  DEBUG: 'false',
  MONGO_URI: 'mongodb://localhost:27017',
  NODE_ENV: 'test',
  SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
  VERBOSE: 'false'
} satisfies { [K in keyof BaseEnv]?: string };

describe('AppFactory', () => {
  describe('create', () => {
    const createApp = (options?: Partial<CreateAppOptions>) => {
      return AppFactory.create({
        envSchema: $BaseEnv,
        prisma: {
          dbPrefix: null
        },
        version: '1',
        ...options
      });
    };

    beforeAll(() => {
      Object.entries(env).forEach(([key, value]) => {
        vi.stubEnv(key, value);
      });
    });

    it('should return an error if it cannot parse the schema', () => {
      vi.stubEnv('VERBOSE', '1');
      const result = createApp();
      expect(result.isErr() && result.error).toMatchObject({
        cause: expect.any(ValidationException),
        message: 'Failed to parse environment config'
      });
      vi.stubEnv('VERBOSE', env.VERBOSE);
    });
  });
});
