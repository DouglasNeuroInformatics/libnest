import type { AppAbility } from '../modules/auth/auth.config.js';

declare global {
  namespace Express {
    interface Request {
      locale?: string;
      user?: User;
    }
    interface User {
      [key: string]: unknown;
      ability?: AppAbility;
    }
  }
}
