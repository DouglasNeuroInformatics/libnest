import { AbilityBuilder, detectSubjectType } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Inject, Injectable } from '@nestjs/common';

import { APPLY_PERMISSIONS_TOKEN } from './auth.config.js';

import type { AbilityModifier, AppAbility } from './auth.config.js';

@Injectable()
export class AbilityFactory {
  constructor(@Inject(APPLY_PERMISSIONS_TOKEN) private readonly applyPermissions?: AbilityModifier) {}

  createForUser() {
    const abilityBuilder = new AbilityBuilder<AppAbility>(createPrismaAbility);
    if (this.applyPermissions) {
      this.applyPermissions(abilityBuilder);
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
}
