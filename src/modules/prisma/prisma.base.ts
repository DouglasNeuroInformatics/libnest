export declare namespace PrismaLike {
  export const ModelName: { [key: string]: string };
  export const prismaVersion: any;
}

export abstract class PrismaClientLike {
  [key: string]: any;
  abstract $connect(...args: any[]): Promise<void>;
  abstract $disconnect(...args: any[]): Promise<void>;
  abstract $runCommandRaw(...args: any[]): Promise<{ [key: string]: any }>;
}

export declare namespace PrismaModuleLike {
  export const PrismaClient: typeof PrismaClientLike;
  export const Prisma: typeof PrismaLike;
}
