/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-empty-object-type */

export type PrismaModelName = typeof import('@prisma/client') extends {
  Prisma: {
    ModelName: infer TModelName;
  };
}
  ? keyof TModelName
  : string;

export type PrismaClientLike = {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $runCommandRaw(command: { [key: string]: any }): Promise<{ [key: string]: any }>;
  [key: string]: unknown;
};

export interface PrismaUserClient extends PrismaClientLike {}

export type Model<T extends PrismaModelName> = PrismaUserClient[`${Uncapitalize<T>}`];
