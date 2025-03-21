import { isPlainObject } from '@douglasneuroinformatics/libjs';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { PRISMA_CLIENT_TOKEN } from './prisma.config.js';

@Injectable()
export class PrismaService implements OnApplicationShutdown, OnModuleInit {
  constructor(@Inject(PRISMA_CLIENT_TOKEN) public readonly client: PrismaClient) {}

  async dropDatabase(): Promise<void> {
    const result = await this.client.$runCommandRaw({ dropDatabase: 1 });
    if (!isPlainObject(result) || result.ok !== 1) {
      throw new InternalServerErrorException('Failed to drop database: raw mongodb command returned unexpected value', {
        cause: result
      });
    }
  }

  async getDbName(): Promise<string> {
    const result = await this.client.$runCommandRaw({ dbStats: 1 });
    if (!isPlainObject(result) || typeof result.db !== 'string') {
      throw new InternalServerErrorException('Failed to get db name: raw mongodb command returned unexpected value', {
        cause: result
      });
    }
    return result.db;
  }

  async getDbStats(): Promise<{
    collections: number;
    db: string;
    objects: number;
  }> {
    return (await this.client.$runCommandRaw({ dbStats: 1 })) as {
      collections: number;
      db: string;
      objects: number;
    };
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.$disconnect();
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }
}
