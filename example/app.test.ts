import { describe, expect, vi } from 'vitest';

import { e2e } from '../src/testing/index.js';
import app from './app.js';

import type { $Cat, $CreateCatData } from './cats/schemas/cat.schema.js';

vi.unmock('@prisma/client');

e2e(app, ({ api }) => {
  describe('/docs', (it) => {
    it('should configure the documentation spec', async () => {
      const response = await api.get('/docs/spec.json');
      expect(response.status).toBe(200);
    });
    it('should configure the documentation html', async () => {
      const response = await api.get('/docs');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });

  describe('/cats', (it) => {
    let createdCat: $Cat;

    it('should allow a POST request', async () => {
      const response = await api.post('/cats').send({
        age: 1,
        name: 'Winston'
      } satisfies $CreateCatData);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        _id: expect.any(String),
        age: expect.any(Number),
        name: expect.any(String)
      } satisfies $Cat);
      createdCat = response.body;
    });

    it('should allow a GET request', async () => {
      const response = await api.get('/cats');
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([createdCat]);
    });
  });
});
