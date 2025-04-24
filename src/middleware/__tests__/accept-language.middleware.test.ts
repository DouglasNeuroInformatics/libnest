import express from 'express';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { acceptLanguage } from '../accept-language.middleware.js';

describe('acceptLanguage', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(acceptLanguage({ fallbackLanguage: 'en', supportedLanguages: ['en', 'fr'] }));
    const greetings = { en: 'Hello', fr: 'Bonjour' };
    app.get('/', (req, res) => {
      res.status(200).json({ greeting: greetings[req.locale as keyof typeof greetings] });
    });
  });

  it('should return an English greeting if the user accepts any language', async () => {
    const response = await request(app).get('/').set('Accept-Language', '*');
    expect(response.body).toStrictEqual({ greeting: 'Hello' });
  });

  it('should return an English greeting if the user locale is en-US', async () => {
    const response = await request(app).get('/').set('Accept-Language', 'en-US');
    expect(response.body).toStrictEqual({ greeting: 'Hello' });
  });

  it('should return a French greeting if the user locale is fr', async () => {
    const response = await request(app).get('/').set('Accept-Language', 'fr');
    expect(response.body).toStrictEqual({ greeting: 'Bonjour' });
  });

  it("should return a French greeting if the user's preferred locale is fr-CA, but also accepts en-CA", async () => {
    const response = await request(app).get('/').set('Accept-Language', 'fr-CA,en-CA');
    expect(response.body).toStrictEqual({ greeting: 'Bonjour' });
  });

  it("should return a French greeting if the user's preferred locale is de, but accepts fr at a higher quality than en", async () => {
    const response = await request(app).get('/').set('Accept-Language', 'de,fr;q=0.9,en;q=0.8');
    expect(response.body).toStrictEqual({ greeting: 'Bonjour' });
  });

  it("should return a French greeting if the user's preferred locale is de, but accepts en at a higher quality than fr", async () => {
    const response = await request(app).get('/').set('Accept-Language', 'de,fr;q=0.8,en;q=0.9');
    expect(response.body).toStrictEqual({ greeting: 'Hello' });
  });

  it("should return an English greeting if none of the user's preferred locales are supported", async () => {
    const response = await request(app).get('/').set('Accept-Language', 'es,de;q=0.9');
    expect(response.body).toStrictEqual({ greeting: 'Hello' });
  });
});
