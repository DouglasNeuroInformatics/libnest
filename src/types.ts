/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/consistent-type-definitions */

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
    interface User {
      [key: string]: unknown;
    }
  }
  namespace Libnest {
    interface ConfigOptions {
      entry: string;
      globals?: {
        [key: string]: unknown;
      };
    }
  }
}

export type ConfigOptions = Libnest.ConfigOptions;

export interface RuntimeConfig {}

export interface PrismaClientLike {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $runCommandRaw(command: { [key: string]: unknown }): Promise<{ [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface PrismaClient extends PrismaClientLike {}

export type PrismaModelName = typeof import('@prisma/client') extends {
  Prisma: {
    ModelName: infer TModelName;
  };
}
  ? keyof TModelName
  : string;

export type Model<T extends PrismaModelName> = PrismaClient[`${Uncapitalize<T>}`];
