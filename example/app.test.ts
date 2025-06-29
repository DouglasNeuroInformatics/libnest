import { randomBytes } from 'crypto';

import { Document, Window } from 'happy-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, vi } from 'vitest';

import { e2e } from '../src/testing/index.js';
import app from './app.js';

import type { $Cat, $CreateCatData } from './cats/schemas/cat.schema.js';

vi.unmock('@prisma/client');

e2e(app, ({ api }) => {
  describe('/', (it) => {
    let document: Document;
    let window: Window;

    beforeAll(() => {
      window = new Window({
        innerHeight: 768,
        innerWidth: 1024,
        url: 'http://localhost:5500'
      });
      document = window.document as any;

      window.console.error = (...args) => {
        console.error(...args);
      };
    });

    afterAll(async () => {
      await window.happyDOM.close();
    });

    it('should render html', async () => {
      const response = await api.get('/');
      expect(response.type).toBe('text/html');
    });

    it('should render an interactive UI', async () => {
      const response = await api.get('/');
      document.write(response.text);
      await window.happyDOM.waitUntilComplete();
      const h1 = document.querySelector('h1')!;
      expect(h1.innerText).toBe('Welcome to the Example App');
      const ul = document.querySelector('ul')!;
      expect(ul.style.display).toBe('none');
      const button = document.querySelector('button')!;
      button.click();
      await window.happyDOM.waitUntilComplete();

      // expect(ul.style.display).toBe('block');
    });
  });

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

  describe('/auth/login', (it) => {
    it('should return status code 400 if the request body does not include credentials', async () => {
      const response = await api.post('/auth/login');
      expect(response.status).toBe(400);
    });
    it('should return status code 400 if the request body does not include a username', async () => {
      const response = await api.post('/auth/login').send({ username: 'admin' });
      expect(response.status).toBe(400);
    });
    it('should return status code 400 if the request body does not include a password', async () => {
      const response = await api.post('/auth/login').send({ password: 'password' });
      expect(response.status).toBe(400);
    });
    it('should return status code 400 if username and password are empty strings', async () => {
      const response = await api.post('/auth/login').send({ password: '', username: '' });
      expect(response.status).toBe(400);
    });
    it('should return status code 400 if password is a number', async () => {
      const response = await api.post('/auth/login').send({ password: 123, username: 'admin' });
      expect(response.status).toBe(400);
    });
    it('should return status code 401 if the user does not exist', async () => {
      const response = await api.post('/auth/login').send({ password: 'password', username: 'user' });
      expect(response.status).toBe(401);
    });
    it('should return status code 200 and an access token if the credentials are correct', async () => {
      const response = await api.post('/auth/login').send({ password: 'password', username: 'admin' });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        accessToken: expect.stringMatching(/^[A-Za-z0-9-_]+\.([A-Za-z0-9-_]+)\.[A-Za-z0-9-_]+$/)
      });
    });
  });

  describe('/cats', (it) => {
    let accessToken: string;
    let createdCat: $Cat;

    beforeEach(async () => {
      const response = await api.post('/auth/login').send({ password: 'password', username: 'admin' });
      accessToken = response.body.accessToken;
    });

    it('should return status code 401 if there is no access token provided', async () => {
      const response = await api.get('/cats');
      expect(response.status).toBe(401);
    });

    it('should return status code 401 if there is an invalid access token provided', async () => {
      const response = await api.get('/cats').set('Authorization', `Bearer ${randomBytes(12).toString('base64')}`);
      expect(response.status).toBe(401);
    });

    it('should allow a POST request', async () => {
      const response = await api
        .post('/cats')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
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
      const response = await api.get('/cats').set('Authorization', `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([createdCat]);
    });
  });
});
