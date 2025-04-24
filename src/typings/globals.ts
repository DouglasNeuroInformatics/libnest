import type { Locale } from '../middleware/accept-language.middleware.js';
import type { AppAbility } from '../modules/auth/auth.config.js';

declare global {
  namespace Express {
    interface Request {
      locale?: Locale;
      user?: User;
    }
    interface User {
      [key: string]: unknown;
      ability?: AppAbility;
    }
  }
}
