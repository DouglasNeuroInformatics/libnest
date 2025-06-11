/* eslint-disable no-var */

import type { AppAbility } from '../modules/auth/auth.config.js';
import type { UserTypes } from '../user-config.js';
import type { Locale } from '../user-types.js';

declare global {
  namespace Express {
    interface Request {
      locale?: Locale;
      user?: User;
    }
    interface User extends UserTypes.JwtPayload {
      [key: string]: unknown;
      ability: AppAbility;
    }
  }
  interface LibnestStatic {
    configFile: string;
  }
  var __LIBNEST_STATIC: LibnestStatic;
}
