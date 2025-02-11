import { describe, expect, it } from 'vitest';

import { LOGGING_OPTIONS_TOKEN } from '../logging.config.js';
import { LoggingModule } from '../logging.module.js';

describe('LoggingModule', () => {
  describe('forRoot', () => {
    it('should provide the options token', () => {
      const options = { log: true };
      const module = LoggingModule.forRoot(options);
      expect(module.providers).toContainEqual({
        provide: LOGGING_OPTIONS_TOKEN,
        useValue: {
          log: true
        }
      });
    });
  });
});
