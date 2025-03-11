import { AbilityBuilder, detectSubjectType, PureAbility } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Inject, Injectable } from '@nestjs/common';

import { DEFINE_ABILITY_TOKEN } from './auth.config.js';

import type { AppAbilities, AppAbility, AppConditions, DefineAbility, Permission } from './auth.config.js';

@Injectable()
export class AbilityFactory {
  constructor(@Inject(DEFINE_ABILITY_TOKEN) private readonly defineAbility?: DefineAbility) {}

  createForPayload(tokenPayload: { [key: string]: any }): AppAbility {
    const abilityBuilder = new AbilityBuilder<AppAbility>(createPrismaAbility);
    if (this.defineAbility) {
      this.defineAbility(abilityBuilder, tokenPayload);
    }
    return abilityBuilder.build({
      detectSubjectType: (obj: { [key: string]: unknown }) => {
        if (typeof obj.__modelName === 'string') {
          return obj.__modelName;
        }
        return detectSubjectType(obj);
      }
    });
  }

  createForPermissions(permissions: Permission[]): AppAbility {
    return new PureAbility<AppAbilities, AppConditions>(permissions);
  }
}
