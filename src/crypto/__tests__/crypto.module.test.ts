import { describe, expect, it } from 'vitest';

import { CryptoModule } from '../crypto.module.js';

describe('CryptoModule', () => {
  describe('forRoot', () => {
    it('should register as a global module', () => {
      expect(CryptoModule.forRoot({ secretKey: '123' })).toMatchObject({
        global: true
      });
    });
  });
});
