import { AbilityBuilder, detectSubjectType } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Inject, Injectable } from '@nestjs/common';

import { LoggingService } from '../logging/logging.service.js';
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

  constructor(
    private readonly loggingService: LoggingService,
    @Inject(DEFINE_ABILITY_TOKEN) private readonly defineAbility?: DefineAbility
  ) {}

  createForPayload(payload: { [key: string]: any }, metadata: unknown): AppAbility {
    this.loggingService.verbose({
      message: 'Creating Ability From Payload',
      metadata,
      payload
    });
    const abilityBuilder = new AbilityBuilder<AppAbility>(createPrismaAbility);
    if (this.defineAbility) {
      this.defineAbility(abilityBuilder, payload, metadata);
    }
    return abilityBuilder.build({
      detectSubjectType: this.detectSubjectType
    });
  }

  createForPermissions(permissions: Permission[]): AppAbility {
    this.loggingService.verbose({
      message: 'Creating Ability From Permissions',
      permissions
    });
    return createPrismaAbility<AppAbilities>(permissions, {
      detectSubjectType: this.detectSubjectType
    });
  }
}
