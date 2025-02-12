import { describe, expect, it } from 'vitest';

import { ConfigModule } from '../config.module.js';
import { ConfigService } from '../config.service.js';
import { CONFIG_TOKEN } from '../config.token.js';

describe('ConfigModule', () => {
  describe('forRoot', () => {
    it('should register the correct providers globally', () => {
      expect(ConfigModule.forRoot({ config: {} as any })).toMatchObject({
        global: true,
        providers: [
          {
            provide: CONFIG_TOKEN,
            useValue: {}
          },
          ConfigService
        ]
      });
    });
  });
});
