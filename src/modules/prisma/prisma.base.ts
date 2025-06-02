export declare namespace PrismaLike {
  export type ModelName = string;
  export const prismaVersion: any;
}

export type PrismaClientLike = new (...args: any[]) => {
  $connect(...args: any[]): Promise<void>;
  $disconnect(...args: any[]): Promise<void>;
  $runCommandRaw(...args: any[]): Promise<{ [key: string]: any }>;
  [key: string]: any;
};
