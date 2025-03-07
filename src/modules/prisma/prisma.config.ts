import { defineToken } from '../../utils/token.utils.js';

export type PrismaModuleOptions = {
  dbPrefix: null | string;
};

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');
