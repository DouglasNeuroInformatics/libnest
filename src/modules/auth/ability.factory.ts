import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Inject, Injectable } from '@nestjs/common';

import { LoggingService } from '../logging/logging.service.js';
import { createAppAbility, detectAppSubject } from './ability.utils.js';
import { DEFINE_ABILITY_TOKEN } from './auth.config.js';

import type { AppAbility, DefineAbility, Permission } from './auth.config.js';

@Injectable()
export class AbilityFactory {
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
      detectSubjectType: detectAppSubject
    });
  }

  createForPermissions(permissions: Permission[]): AppAbility {
    this.loggingService.verbose({
      message: 'Creating Ability From Permissions',
      permissions
    });
    return createAppAbility(permissions);
  }
}
