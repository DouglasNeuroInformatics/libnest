import { SetMetadata } from '@nestjs/common';

import { defineToken } from '../utils/token.utils.js';

import type { AppAction, AppSubjectName } from '../modules/auth/auth.config.js';

const { ROUTE_ACCESS_METADATA_KEY } = defineToken('ROUTE_ACCESS_METADATA_KEY');

export type PublicRouteAccess = 'public';

export type ProtectedRoutePermissionSet = {
  action: AppAction;
  subject: AppSubjectName;
};

export type ProtectedRouteAccess = ProtectedRoutePermissionSet | ProtectedRoutePermissionSet[];

export type RouteAccessType = ProtectedRouteAccess | PublicRouteAccess;

export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata(ROUTE_ACCESS_METADATA_KEY, value);
}

export { ROUTE_ACCESS_METADATA_KEY };
