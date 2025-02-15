export interface PrismaClientLike {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $runCommandRaw(command: { [key: string]: unknown }): Promise<{ [key: string]: unknown }>;
  [key: string]: unknown;
}

/**
 * Represents the `PrismaClient` for your application. Users should augment
 * this declaration with their own `PrismaClient`.
 */
export interface RuntimePrismaClient extends PrismaClientLike {}

export type PrismaModelName = typeof import('@prisma/client') extends {
  Prisma: {
    ModelName: infer TModelName;
  };
}
  ? keyof TModelName
  : string;

export type Model<T extends PrismaModelName> = RuntimePrismaClient[`${Uncapitalize<T>}`];
