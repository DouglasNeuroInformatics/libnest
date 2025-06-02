import { isPlainObject } from '@douglasneuroinformatics/libjs';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';

import { $MongoStats } from '../../schemas/mongo-stats.schema.js';
import { PRISMA_CLIENT_TOKEN } from './prisma.config.js';

import type { MongoStats } from '../../schemas/mongo-stats.schema.js';
import type { PrismaClientLike } from './prisma.types.js';

@Injectable()
export class PrismaService implements OnApplicationShutdown, OnModuleInit {
  constructor(@Inject(PRISMA_CLIENT_TOKEN) public readonly client: PrismaClientLike) {}

  async dropDatabase(): Promise<void> {
    const result = await this.client.$runCommandRaw({ dropDatabase: 1 });
    if (!isPlainObject(result) || result.ok !== 1) {
      throw new InternalServerErrorException('Failed to drop database: raw mongodb command returned unexpected value', {
        cause: result
      });
    }
  }

  async getDbName(): Promise<string> {
    const { db } = await this.getDbStats();
    return db;
  }

  async getDbStats(): Promise<MongoStats> {
    const commandOutput = await this.client.$runCommandRaw({ dbStats: 1 });
    const result = await $MongoStats.safeParseAsync(commandOutput);
    if (!result.success) {
      throw new InternalServerErrorException('Raw mongodb command returned unexpected value', {
        cause: result.error
      });
    }
    return result.data;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.$disconnect();
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }
}
