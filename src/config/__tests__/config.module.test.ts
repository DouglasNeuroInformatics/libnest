import type { DynamicModule } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { ConfigModule } from '../config.module.js';
import { CONFIG_TOKEN } from '../config.token.js';

describe('ConfigModule', () => {
  const $Config = z.object({
    API_KEY: z.string().min(5).pipe(z.coerce.number().positive()),
    DEBUG: z
      .enum(['true', 'false'])
      .transform((arg) => JSON.parse(arg) as boolean)
      .optional()
  });
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
      const configModule = ConfigModule.forRoot({ schema: $Config });
      expect(configModule.providers).toBeInstanceOf(Array);
      expect(configModule.providers?.[0]).toMatchObject({
        provide: CONFIG_TOKEN,
        useValue: {
          API_KEY: 12345
        }
      });
    });
    it('should apply conditional modules correctly', () => {
      vi.stubEnv('API_KEY', '12345');
      vi.stubEnv('DEBUG', 'false');
      const MockModule = vi.fn();
      let configModule: DynamicModule;
      configModule = ConfigModule.forRoot<z.infer<typeof $Config>>({
        conditionalModules: [
          {
            module: MockModule,
            when: 'DEBUG'
          }
        ],
        schema: $Config
      });
      expect(configModule.imports?.length).toBe(0);
      vi.stubEnv('DEBUG', 'true');
      configModule = ConfigModule.forRoot<z.infer<typeof $Config>>({
        conditionalModules: [
          {
            module: MockModule,
            when: 'DEBUG'
          }
        ],
        schema: $Config
      });
      expect(configModule.imports?.length).toBe(1);
      expect(configModule.imports?.at(0)).toBe(MockModule);
    });
  });
});
