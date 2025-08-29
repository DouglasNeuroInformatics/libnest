import { beforeEach, describe, expect, it } from 'vitest';

import { MockPrismaClient } from '../../../testing/mocks/prisma.client.mock.js';
import { PrismaService } from '../prisma.service.js';

describe('PrismaService', () => {
  let prismaClientMock: any;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaClientMock = new MockPrismaClient({ modelNames: [] });
    prismaService = new PrismaService(prismaClientMock);
  });

  describe('onModuleInit', () => {
    it('should call $connect on the Prisma client', async () => {
      await prismaService.onModuleInit();
      expect(prismaClientMock.$connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('onApplicationShutdown', () => {
    it('should call $disconnect on the Prisma client', async () => {
      await prismaService.onApplicationShutdown();
      expect(prismaClientMock.$disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
