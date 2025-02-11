import type { BaseRuntimeConfig } from './config/config.schema.js';

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

export interface RuntimeConfig extends BaseRuntimeConfig {}

export interface UserConfigOptions {
  entry: string;
  globals?: {
    [key: string]: unknown;
  };
}

export function defineUserConfig(config: UserConfigOptions) {
  return config;
}

export type { PrismaClient } from './prisma/prisma.types.js';
