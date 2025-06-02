export declare namespace PrismaLike {
  export const ModelName: { [key: string]: string };
  export const prismaVersion: any;
}

export type PrismaClientLike = new (...args: any[]) => {
  $connect(...args: any[]): Promise<void>;
  $disconnect(...args: any[]): Promise<void>;
  $runCommandRaw(...args: any[]): Promise<{ [key: string]: any }>;
  [key: string]: any;
};

export declare namespace PrismaModuleLike {
  export const PrismaClient: PrismaClientLike;
  export const Prisma: typeof PrismaLike;
}
