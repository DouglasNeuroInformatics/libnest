import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { ConfigModule } from '../config.module.js';
import { CONFIG_TOKEN } from '../config.token.js';

describe('ConfigModule', () => {
  const $Config = z.object({ API_KEY: z.string().min(5).pipe(z.coerce.number().positive()) });
  describe('forRoot', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });
    it('should throw an error if the schema parsing fails', () => {
      vi.stubEnv('API_KEY', '123');
      expect(() => ConfigModule.forRoot({ schema: $Config })).toThrow('Failed to Parse Environment Variables');
    });
    it('should successfully parse the schema', () => {
      vi.stubEnv('API_KEY', '12345');
      const module = ConfigModule.forRoot({ schema: $Config });
      expect(module.providers).toBeInstanceOf(Array);
      expect(module.providers?.[0]).toMatchObject({
        provide: CONFIG_TOKEN,
        useValue: {
          API_KEY: 12345
        }
      });
    });
  });
});
