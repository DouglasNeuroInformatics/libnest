/* eslint-disable perfectionist/sort-objects */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';

import { InjectPrismaClient } from '../../src/index.js';

import type { $Cat } from './schemas/cat.schema.js';

@Injectable()
export class CatsService {
  constructor(@InjectPrismaClient() private readonly prismaClient: PrismaClient) {}

  async create(cat: Omit<$Cat, '_id'>): Promise<$Cat> {
    const id = crypto.randomUUID();
    const result = await this.prismaClient.$runCommandRaw({
      insert: 'Cat',
      documents: [{ ...cat, _id: id }]
    });
    if (result.ok !== 1) {
      throw new InternalServerErrorException('Failed to create cat');
    }
    return { ...cat, _id: id };
  }

  async findAll(): Promise<$Cat[]> {
    const result = (await this.prismaClient.$runCommandRaw({
      find: 'Cat',
      batchSize: 1000
    })) as { cursor: { firstBatch: $Cat[]; id: string }; ok: number };
    if (result.ok !== 1) {
      throw new InternalServerErrorException('Failed to find cats');
    }
    return result.cursor.firstBatch;
  }
}
