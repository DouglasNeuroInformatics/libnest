import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import { AbilityFactory } from '../ability.factory.js';
import { DEFINE_ABILITY_TOKEN } from '../auth.config.js';

import type { DefineAbility, Permission } from '../auth.config.js';

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
    it('should return an empty ruleset, if defineAbility is undefined', () => {
      const ability = abilityFactory.createForPayload({});
      expect(ability.rules).toStrictEqual([]);
    });
    it('should add the correct ruleset for the ability', () => {
      defineAbility.mockImplementationOnce((ability) => {
        ability.can('manage', 'all');
      });
      const ability = abilityFactory.createForPayload({});
      expect(ability.rules).toStrictEqual([
        {
          action: 'manage',
          subject: 'all'
        }
      ]);
      expect(ability.can('create', 'Cat')).toBe(true);
    });
    it('should correctly detect the subject type', () => {
      defineAbility.mockImplementationOnce((ability) => {
        ability.can('manage', 'Cat', { id: { in: [0, 1] } });
      });
      const ability = abilityFactory.createForPayload({});
      expect(ability.rules).toStrictEqual([
        {
          action: 'manage',
          conditions: {
            id: {
              in: [0, 1]
            }
          },
          subject: 'Cat'
        }
      ]);
      const cat1 = { __modelName: 'Cat', id: 1 };
      const cat2 = { __modelName: 'Cat', id: 2 };
      const dog = { __modelName: 'Dog', id: 1 };
      const obj = { id: 1 };
      expect(ability.can('manage', cat1)).toBe(true);
      expect(ability.can('manage', cat2)).toBe(false);
      expect(ability.can('manage', dog)).toBe(false);
      expect(ability.can('manage', obj as any)).toBe(false);
    });
  });

  describe('createForPermissions', () => {
    it('should create an ability for an empty permissions set', () => {
      const permissions: Permission[] = [];
      const ability = abilityFactory.createForPermissions(permissions);
      expect(ability.rules).toStrictEqual(permissions);
    });
    it('should create an ability for a simple ruleset', () => {
      const permissions: Permission[] = [{ action: 'manage', subject: 'all' }];
      const ability = abilityFactory.createForPermissions(permissions);
      expect(ability.rules).toStrictEqual(permissions);
      expect(ability.can('create', 'Cat')).toBe(true);
    });
    // it('should correctly detect the subject type', () => {
    //   const permissions: Permission[] = [
    //     {
    //       action: 'manage',
    //       conditions: {
    //         id: {
    //           in: [0, 1]
    //         }
    //       },
    //       subject: 'Cat'
    //     }
    //   ];
    //   const ability = abilityFactory.createForPermissions(permissions);
    //   expect(ability.rules).toStrictEqual(permissions);

    //   // const cat1 = { __modelName: 'Cat', id: 1 };
    //   // const cat2 = { __modelName: 'Cat', id: 2 };
    //   // const dog = { __modelName: 'Dog', id: 1 };
    //   // const obj = { id: 1 };
    //   // expect(ability.can('manage', cat1)).toBe(true);
    //   // expect(ability.can('manage', cat2)).toBe(false);
    //   // expect(ability.can('manage', dog)).toBe(false);
    //   // expect(ability.can('manage', obj as any)).toBe(false);
    // });
  });
});
