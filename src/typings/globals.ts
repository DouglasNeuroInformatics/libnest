/* eslint-disable no-var */

import type { Locale } from '../user-types.js';

declare global {
  namespace Express {
    interface Request {
      locale?: Locale;
      user?: User;
    }
    interface User {
      [key: string]: unknown;
    }
  }
  interface LibnestStatic {
    configFile: string;
  }
  var __LIBNEST_STATIC: LibnestStatic;
}
