/* eslint-disable no-var */

import type { UserTypes } from './user-config.js';

declare global {
  interface LibnestStatic {
    configFile: string;
  }
  var __LIBNEST_STATIC: LibnestStatic;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserTypes.RequestUser;
  }
}
