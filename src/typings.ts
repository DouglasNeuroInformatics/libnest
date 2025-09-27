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
    accepts(): {
      languages(languages: UserTypes.Locale[]): false | string;
    };
    locale?: UserTypes.Locale;
    user?: UserTypes.RequestUser;
  }
}
