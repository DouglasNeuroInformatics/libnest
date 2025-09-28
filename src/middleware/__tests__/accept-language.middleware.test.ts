import { describe, expect, it, vi } from 'vitest';

import { acceptLanguage } from '../accept-language.middleware.js';

describe('acceptLanguage', () => {
  const middleware = acceptLanguage({ fallbackLanguage: 'en', supportedLanguages: ['en', 'fr'] });
  const next = vi.fn();

  it('should set the locale to English if the user accepts any language', () => {
    const req: any = { headers: { 'accept-language': '*' } };
    middleware(req, null!, next);
    expect(req.locale).toBe('en');
  });

  it('should set the locale to English if the user locale is en-US', () => {
    const req: any = { headers: { 'accept-language': 'en-US' } };
    middleware(req, null!, next);
    expect(req.locale).toBe('en');
  });

  it('should set the locale to French if the user locale is fr', () => {
    const req: any = { headers: { 'accept-language': 'fr' } };
    middleware(req, null!, next);
    expect(req.locale).toBe('fr');
  });

  it("should set the locale to French if the user's preferred locale is fr-CA, but also accepts en-CA", () => {
    const req: any = { headers: { 'accept-language': 'fr-CA,en-CA' } };
    middleware(req, null!, next);
    expect(req.locale).toBe('en');
  });

  it("should set the locale to French if the user's preferred locale is de, but accepts fr at a higher quality than en", () => {
    const req: any = { headers: { 'accept-language': 'de,fr;q=0.9,en;q=0.8' } };
    middleware(req, null!, next);
    expect(req.locale).toBe('fr');
  });

  it("should set the locale to English if the user's preferred locale is de, but accepts en at a higher quality than fr", () => {
    const req: any = { headers: { 'accept-language': 'de,fr;q=0.8,en;q=0.9' } };
    middleware(req, null!, next);
    expect(req.locale).toBe('en');
  });

  it("should set the locale to English if none of the user's preferred locales are supported", () => {
    const req: any = { headers: { 'accept-language': 'es,de;q=0.9' } };
    middleware(req, null!, next);
    expect(req.locale).toBe('en');
  });
});
