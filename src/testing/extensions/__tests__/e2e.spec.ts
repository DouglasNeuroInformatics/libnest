import { NestApplication } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { e2e } from '../e2e.js';

e2e('e2e (self)', ({ app }) => {
  describe('app', () => {
    it('should be an instance of NestApplication', () => {
      expect(app).toBeInstanceOf(NestApplication);
    });
  });
});
