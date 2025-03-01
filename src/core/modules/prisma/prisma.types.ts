import type { UserConfig } from '../../../config/index.js';

export interface PrismaClientLike {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $runCommandRaw(command: { [key: string]: unknown }): Promise<{ [key: string]: unknown }>;
  [key: string]: any;
}

export type RuntimePrismaClient = UserConfig extends {
  RuntimePrismaClient: infer TPrismaClient extends PrismaClientLike;
}
  ? TPrismaClient
  : PrismaClientLike;

export type PrismaModelName = typeof import('@prisma/client') extends {
  Prisma: {
    ModelName: infer TModelName;
  };
}
  ? keyof TModelName
  : string;

export type Model<T extends PrismaModelName> = RuntimePrismaClient[`${Uncapitalize<T>}`];
