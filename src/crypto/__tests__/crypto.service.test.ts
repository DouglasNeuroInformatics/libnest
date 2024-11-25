import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CRYPTO_MODULE_OPTIONS_TOKEN, type CryptoModuleOptions } from '../crypto.config.js';
import { CryptoService } from '../crypto.service.js';

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: CRYPTO_MODULE_OPTIONS_TOKEN,
          useValue: {
            secretKey: 'testing'
          } satisfies CryptoModuleOptions
        }
      ]
    }).compile();
    cryptoService = moduleRef.get(CryptoService);
  });

  it('should be defined', () => {
    expect(cryptoService).toBeDefined();
  });

  describe('hash', () => {
    it('should create a hash that is not equal to the input value', () => {
      expect(cryptoService.hash('foo')).not.toBe('foo');
    });

    it('should create two hashes with the same value', () => {
      expect(cryptoService.hash('foo')).toBe(cryptoService.hash('foo'));
    });
  });

  describe('hashPassword', () => {
    it('should create a hash that is not equal to the input value', async () => {
      await expect(cryptoService.hashPassword('foo')).resolves.not.toBe('foo');
    });

    it('should create two different hashes for the same value, both of which can be verified', async () => {
      const h1 = await cryptoService.hashPassword('foo');
      const h2 = await cryptoService.hashPassword('foo');
      expect(h1).not.toBe(h2);
      await expect(cryptoService.comparePassword('foo', h1)).resolves.toBe(true);
      await expect(cryptoService.comparePassword('foo', h2)).resolves.toBe(true);
    });

    it('should return false when comparing a hash with an incorrect value', async () => {
      const hash = await cryptoService.hashPassword('foo');
      await expect(cryptoService.comparePassword('bar', hash)).resolves.toBe(false);
    });
  });
});
