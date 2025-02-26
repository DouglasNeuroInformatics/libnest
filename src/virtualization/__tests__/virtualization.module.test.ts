import { describe, expect, it } from 'vitest';

import { LIBNEST_VIRTUALIZATION_MODULE_OPTIONS_TOKEN } from '../virtualization.config.js';
import { VirtualizationModule } from '../virtualization.module.js';

describe('VirtualizationModule', () => {
  describe('forRoot', () => {
    it('should provide the context', () => {
      expect(
        VirtualizationModule.forRoot({
          context: {
            test: true
          }
        })
      ).toMatchObject({
        providers: expect.arrayContaining([
          {
            provide: LIBNEST_VIRTUALIZATION_MODULE_OPTIONS_TOKEN,
            useValue: {
              context: {
                test: true
              }
            }
          }
        ])
      });
    });
  });
});
