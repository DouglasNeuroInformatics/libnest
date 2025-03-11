import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { AbilityFactory } from '../ability.factory.js';
import { DEFINE_ABILITY_TOKEN } from '../auth.config.js';

import type { DefineAbility } from '../auth.config.js';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;
  let defineAbility: Mock<DefineAbility>;

  beforeEach(async () => {
    defineAbility = vi.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AbilityFactory,
        {
          provide: DEFINE_ABILITY_TOKEN,
          useValue: defineAbility
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
