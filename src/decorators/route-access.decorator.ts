import { SetMetadata } from '@nestjs/common';

import { defineToken } from '../utils/token.utils.js';

const { ROUTE_ACCESS_METADATA_KEY } = defineToken('ROUTE_ACCESS_METADATA_KEY');

type PublicRouteAccess = 'public';

export type RouteAccessType = PublicRouteAccess;

export function RouteAccess(value: RouteAccessType): MethodDecorator {
  return SetMetadata(ROUTE_ACCESS_METADATA_KEY, value);
}

export { ROUTE_ACCESS_METADATA_KEY };
