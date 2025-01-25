import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ConfigService } from '../config.service.js';
import { CONFIG_TOKEN } from '../config.token.js';

describe('ConfigService', () => {
  let configService: ConfigService & {
    get: (key: unknown) => unknown;
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CONFIG_TOKEN,
          useValue: {
            foo: true
          }
        },
        ConfigService
      ]
    }).compile();
    configService = moduleRef.get(ConfigService);
  });

  it('should be defined', () => {
    expect(configService).toBeDefined();
  });

  describe('get', () => {
    it('should return the value provided by the token', () => {
      expect(configService.get('foo')).toBe(true);
    });
  });
});
