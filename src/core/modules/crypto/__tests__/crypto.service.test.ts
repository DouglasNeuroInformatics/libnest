import * as crypto from 'node:crypto';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CryptoService } from '../crypto.service.js';

vi.mock('node:crypto', async (importOriginal) => ({
  ...(await importOriginal<typeof import('node:crypto')>())
}));

describe('CryptoService', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    cryptoService = new CryptoService({
      secretKey: 'testing'
    });
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

    it('should throw if pbkdf2 rejects', async () => {
      vi.spyOn(crypto, 'pbkdf2').mockImplementationOnce((_password, _salt, _iterations, _keylen, _digest, callback) => {
        setTimeout(() => {
          callback(new Error('ERROR!'), null!);
        }, 100);
      });
      await expect(cryptoService.hashPassword('foo')).rejects.toThrow('ERROR!');
    });
  });
});
