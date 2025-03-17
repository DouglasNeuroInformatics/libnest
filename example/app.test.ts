import { randomBytes } from 'crypto';

import { beforeEach } from 'vitest';

import { e2e } from '../src/testing/index.js';

import type { EndToEndContext } from '../src/testing/index.js';
import type { CreateCatDto } from './cats/dto/create-cat.dto.js';

e2e((describe) => {
  describe('/spec.json', (it) => {
    it('should configure the documentation', async ({ api, expect }) => {
      const response = await api.get('/spec.json');
      expect(response.status).toBe(200);
    });
  });

  describe('/auth/login', (it) => {
    it('should return status code 400 if the request body does not include credentials', async ({ api, expect }) => {
      const response = await api.post('/v1/auth/login');
      expect(response.status).toBe(400);
    });
    it('should return status code 400 if the request body does not include a username', async ({ api, expect }) => {
      const response = await api.post('/v1/auth/login').send({ username: 'admin' });
      expect(response.status).toBe(400);
    });
    it('should return status code 400 if the request body does not include a password', async ({ api, expect }) => {
      const response = await api.post('/v1/auth/login').send({ password: 'password' });
      expect(response.status).toBe(400);
    });
    it('should return status code 400 if username and password are empty strings', async ({ api, expect }) => {
      const response = await api.post('/v1/auth/login').send({ password: '', username: '' });
      expect(response.status).toBe(400);
    });
    it('should return status code 400 if password is a number', async ({ api, expect }) => {
      const response = await api.post('/v1/auth/login').send({ password: 123, username: 'admin' });
      expect(response.status).toBe(400);
    });
    it('should return status code 401 if the user does not exist', async ({ api, expect }) => {
      const response = await api.post('/v1/auth/login').send({ password: 'password', username: 'user' });
      expect(response.status).toBe(401);
    });
    it('should return status code 200 and an access token if the credentials are correct', async ({ api, expect }) => {
      const response = await api.post('/v1/auth/login').send({ password: 'password', username: 'admin' });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        accessToken: expect.stringMatching(/^[A-Za-z0-9-_]+\.([A-Za-z0-9-_]+)\.[A-Za-z0-9-_]+$/)
      });
    });
  });

  describe('/cats', (it) => {
    let accessToken: string;

    beforeEach<EndToEndContext>(async ({ api }) => {
      const response = await api.post('/v1/auth/login').send({ password: 'password', username: 'admin' });
      accessToken = response.body.accessToken;
    });

    it('should return status code 401 if there is no access token provided', async ({ api, expect }) => {
      const response = await api.get('/v1/cats');
      expect(response.status).toBe(401);
    });

    it('should return status code 401 if there is an invalid access token provided', async ({ api, expect }) => {
      const response = await api.get('/v1/cats').set('Authorization', `Bearer ${randomBytes(12).toString('base64')}`);
      expect(response.status).toBe(401);
    });

    it('should allow a GET request', async ({ api, expect }) => {
      const response = await api.get('/v1/cats').set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
    });

    it('should allow a POST request', async ({ api, expect }) => {
      const response = await api
        .post('/v1/cats')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          age: 1,
          name: 'Winston'
        } satisfies CreateCatDto);
      expect(response.status).toBe(201);
    });
  });
});
