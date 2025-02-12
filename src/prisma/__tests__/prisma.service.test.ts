import { InternalServerErrorException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../prisma.service.js';

describe('PrismaService', () => {
  let prismaClientMock: any;
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaClientMock = {
      $connect: vi.fn().mockResolvedValue(undefined),
      $disconnect: vi.fn().mockResolvedValue(undefined),
      $runCommandRaw: vi.fn()
    };
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

  describe('dropDatabase', () => {
    it('should drop the database successfully', async () => {
      prismaClientMock.$runCommandRaw = vi.fn().mockResolvedValue({ ok: 1 });
      await expect(prismaService.dropDatabase()).resolves.toBeUndefined();
      expect(prismaClientMock.$runCommandRaw).toHaveBeenCalledWith({ dropDatabase: 1 });
    });

    it('should throw an error if dropping the database fails', async () => {
      prismaClientMock.$runCommandRaw = vi.fn().mockResolvedValue({ ok: 0 });
      await expect(prismaService.dropDatabase()).rejects.toThrow(InternalServerErrorException);
      expect(prismaClientMock.$runCommandRaw).toHaveBeenCalledWith({ dropDatabase: 1 });
    });
  });

  describe('getDbName', () => {
    it('should return the database name', async () => {
      prismaClientMock.$runCommandRaw = vi.fn().mockResolvedValue({ db: 'test_db' });
      await expect(prismaService.getDbName()).resolves.toBe('test_db');
      expect(prismaClientMock.$runCommandRaw).toHaveBeenCalledWith({ dbStats: 1 });
    });
  });

  describe('getDbStats', () => {
    it('should return the database stats', async () => {
      const stats = { collections: 5, db: 'test_db', objects: 100 };
      prismaClientMock.$runCommandRaw = vi.fn().mockResolvedValue(stats);
      await expect(prismaService.getDbStats()).resolves.toEqual(stats);
      expect(prismaClientMock.$runCommandRaw).toHaveBeenCalledWith({ dbStats: 1 });
    });
  });
});
