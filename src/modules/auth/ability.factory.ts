import { AbilityBuilder, detectSubjectType } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Inject, Injectable } from '@nestjs/common';

import { DEFINE_ABILITY_TOKEN } from './auth.config.js';

import type { AppAbilities, AppAbility, DefineAbility, Permission } from './auth.config.js';

@Injectable()
export class AbilityFactory {
  private detectSubjectType = (obj: { [key: string]: unknown }): string => {
    if (typeof obj.__modelName === 'string') {
      return obj.__modelName;
    }
    return detectSubjectType(obj);
  };

  constructor(@Inject(DEFINE_ABILITY_TOKEN) private readonly defineAbility?: DefineAbility) {}

  createForPayload(tokenPayload: { [key: string]: any }): AppAbility {
    const abilityBuilder = new AbilityBuilder<AppAbility>(createPrismaAbility);
    if (this.defineAbility) {
      this.defineAbility(abilityBuilder, tokenPayload);
    }
    return abilityBuilder.build({
      detectSubjectType: this.detectSubjectType
    });
  }

  createForPermissions(permissions: Permission[]): AppAbility {
    return createPrismaAbility<AppAbilities>(permissions, {
      detectSubjectType: this.detectSubjectType
    });
  }
}
