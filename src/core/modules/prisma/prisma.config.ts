import { defineToken } from '../../utils/token.utils.js';

export type PrismaModuleOptions = {
  [key: string]: never;
};

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');
