/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type { PrismaClientLike } from './prisma/prisma.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
    interface User {
      [key: string]: unknown;
    }
  }
}

export interface UserConfig {}

export interface UserPrismaClient extends PrismaClientLike {}
