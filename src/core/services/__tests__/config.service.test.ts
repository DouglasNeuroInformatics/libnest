import { beforeEach, describe, expect, it } from 'vitest';

import { ConfigService } from '../config.service.js';

import type { RuntimeConfig } from '../../../config/schema.js';

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      THROTTLER_ENABLED: true
    } as RuntimeConfig);
  });

  describe('get', () => {
    it('should return the value provided by the token', () => {
      expect(configService.get('THROTTLER_ENABLED')).toBe(true);
    });
  });
  describe('getOrThrow', () => {
    it('should return the value provided by the token', () => {
      expect(configService.getOrThrow('THROTTLER_ENABLED')).toBe(true);
    });
    it('should throw if attempting to get a property that is undefined', () => {
      expect(() => configService.getOrThrow('DANGEROUSLY_DISABLE_PBKDF2_ITERATION')).toThrow(
        "Property 'DANGEROUSLY_DISABLE_PBKDF2_ITERATION' is undefined"
      );
    });
  });
});
