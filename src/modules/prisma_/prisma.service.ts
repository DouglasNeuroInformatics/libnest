import { Inject, Injectable } from '@nestjs/common';
import type { OnApplicationShutdown, OnModuleInit } from '@nestjs/common';

import { PRISMA_CLIENT_TOKEN } from './prisma.config.js';

import type { PrismaClientLike } from './prisma.types.js';

@Injectable()
export class PrismaService implements OnApplicationShutdown, OnModuleInit {
  constructor(@Inject(PRISMA_CLIENT_TOKEN) public readonly client: PrismaClientLike) {}

  async onApplicationShutdown(): Promise<void> {
    await this.client.$disconnect();
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }
}
