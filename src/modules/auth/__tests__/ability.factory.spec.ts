import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { AbilityFactory } from '../ability.factory.js';
import { APPLY_PERMISSIONS_TOKEN } from '../auth.config.js';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;
  let applyPermissions: Mock;

  beforeEach(async () => {
    applyPermissions = vi.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AbilityFactory,
        {
          provide: APPLY_PERMISSIONS_TOKEN,
          useValue: applyPermissions
        }
      ]
    }).compile();
    abilityFactory = moduleRef.get(AbilityFactory);
  });

  describe('createForPayload', () => {
    it('should return an empty ruleset, if applyPermissions is undefined', () => {
      expect(abilityFactory.createForPayload({}).rules).toStrictEqual([]);
    });
  });
});
