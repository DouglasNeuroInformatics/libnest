import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PRISMA_CLIENT_TOKEN } from '../../../src/modules/prisma/prisma.config.js';
import { CatsService } from '../cats.service.js';

import type { $Cat } from '../schemas/cat.schema.js';

describe('CatsService', () => {
  let catsService: CatsService;
  let prismaClient: { $runCommandRaw: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prismaClient = {
      $runCommandRaw: vi.fn()
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: PRISMA_CLIENT_TOKEN,
          useValue: prismaClient
        }
      ]
    }).compile();
    catsService = module.get<CatsService>(CatsService);
  });

  describe('create', () => {
    it('should create a new cat successfully', async () => {
      const mockCat: Omit<$Cat, '_id'> = {
        age: 3,
        name: 'Whiskers'
      };
      prismaClient.$runCommandRaw.mockResolvedValue({ ok: 1 });
      const result = await catsService.create(mockCat);
      expect(result).toEqual({
        ...mockCat,
        _id: expect.any(String)
      });
      expect(prismaClient.$runCommandRaw).toHaveBeenCalledWith({
        documents: [{ ...mockCat, _id: expect.any(String) }],
        insert: 'Cat'
      });
    });

    it('should throw InternalServerErrorException when creation fails', async () => {
      const mockCat: Omit<$Cat, '_id'> = {
        age: 3,
        name: 'Whiskers'
      };
      prismaClient.$runCommandRaw.mockResolvedValue({ ok: 0 });
      await expect(catsService.create(mockCat)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all cats successfully', async () => {
      const mockCats: $Cat[] = [
        { _id: '1', age: 3, name: 'Whiskers' },
        { _id: '2', age: 2, name: 'Mittens' }
      ];
      prismaClient.$runCommandRaw.mockResolvedValue({
        cursor: {
          firstBatch: mockCats,
          id: 'some-cursor-id'
        },
        ok: 1
      });
      const result = await catsService.findAll();
      expect(result).toEqual(mockCats);
      expect(prismaClient.$runCommandRaw).toHaveBeenCalledWith({
        batchSize: 1000,
        find: 'Cat'
      });
    });
    it('should throw an InternalServerErrorException if the query fails', async () => {
      prismaClient.$runCommandRaw.mockResolvedValue({
        ok: 0
      });
      await expect(catsService.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
