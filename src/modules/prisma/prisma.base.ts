export declare namespace PrismaLike {
  export const ModelName: { [key: string]: string };
  export const prismaVersion: any;
}

export type PrismaClientLike = {
  $connect(...args: any[]): Promise<void>;
  $disconnect(...args: any[]): Promise<void>;
  $runCommandRaw(...args: any[]): Promise<{ [key: string]: any }>;
  [key: string]: any;
};

export type PrismaClientConstructorLike = new (...args: any[]) => PrismaClientLike;

export declare namespace PrismaModuleLike {
  export const PrismaClient: PrismaClientConstructorLike;
  export const Prisma: typeof PrismaLike;
}
