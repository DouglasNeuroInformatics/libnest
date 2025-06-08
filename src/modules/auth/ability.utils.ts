import { detectSubjectType } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';

import type { AppAbilities, AppAbility, Permission } from './auth.config.js';

export function detectAppSubject(obj: { [key: string]: unknown }): string {
  if (typeof obj.__modelName === 'string') {
    return obj.__modelName;
  }
  return detectSubjectType(obj);
}

export function createAppAbility(permissions: Permission[]): AppAbility {
  return createPrismaAbility<AppAbilities>(permissions, {
    detectSubjectType: detectAppSubject
  });
}
