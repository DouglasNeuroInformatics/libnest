/* eslint-disable no-var */
import type { AppAbility } from '../modules/auth/auth.config.js';
import type { RuntimeLocale } from '../user-types.js';

declare global {
  namespace Express {
    interface Request {
      locale?: RuntimeLocale;
      user?: User;
    }
    interface User {
      [key: string]: unknown;
      ability?: AppAbility;
    }
  }
  interface LibnestStatic {
    configFile: string;
  }
  var __LIBNEST_STATIC: LibnestStatic;
}
