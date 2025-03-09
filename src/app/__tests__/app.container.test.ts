import { ValidationException } from '@douglasneuroinformatics/libjs';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { $BaseEnv } from '../../schemas/env.schema.js';
import { AppContainer } from '../app.container.js';

import type { BaseEnv } from '../../schemas/env.schema.js';
import type { CreateAppContainerOptions } from '../app.container.js';

const env = {
  API_PORT: '5500',
  DEBUG: 'false',
  MONGO_URI: 'mongodb://localhost:27017',
  NODE_ENV: 'test',
  SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
  VERBOSE: 'false'
} satisfies { [K in keyof BaseEnv]?: string };

describe('AppContainer', () => {
  describe('create', () => {
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
});
