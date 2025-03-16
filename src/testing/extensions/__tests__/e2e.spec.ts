import { NestApplication } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { e2e } from '../e2e.js';

e2e('e2e (self)', ({ api, app }) => {
  describe('app', () => {
    it('should be an instance of NestApplication', () => {
      expect(app).toBeInstanceOf(NestApplication);
    });
  });
  describe('api', () => {
    it('should allow sending a get request for the documentation', async () => {
      const response = await api.get('/spec.json');
      expect(response.status).toBe(200);
    });
  });
});
