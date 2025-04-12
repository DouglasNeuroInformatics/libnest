import { Inject, Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';

import { ConfigService } from '../config/config.service.js';
import { LoggingService } from '../logging/logging.service.js';
import { PRISMA_MODULE_OPTIONS_TOKEN } from './prisma.config.js';

import type { PrismaModuleOptions } from './prisma.config.js';

export type MongoConnection = {
  url: URL;
};

@Injectable()
export class ConnectionFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    @Inject(PRISMA_MODULE_OPTIONS_TOKEN) private readonly options: PrismaModuleOptions
  ) {}

  async create(): Promise<MongoConnection> {
    let mongoConnection: MongoConnection;
    const useInMemoryDb = this.configService.get('NODE_ENV') === 'test' && this.options.useInMemoryDbForTesting;
    if (useInMemoryDb) {
      mongoConnection = await this.createMemoryConnection();
    } else {
      mongoConnection = this.createDefaultConnection();
    }
    this.loggingService.log({ message: 'Created Mongo Connection', mongoConnection });
    return mongoConnection;
  }

  private createDefaultConnection(): MongoConnection {
    const mongoUri = this.configService.get('MONGO_URI');
    const env = this.configService.get('NODE_ENV');
    const url = new URL(`${mongoUri.href}/${this.options.dbPrefix}-${env}`);
    const params = {
      directConnection: this.configService.get('MONGO_DIRECT_CONNECTION'),
      replicaSet: this.configService.get('MONGO_REPLICA_SET'),
      retryWrites: this.configService.get('MONGO_RETRY_WRITES'),
      w: this.configService.get('MONGO_WRITE_CONCERN')
    };
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.append(key, String(value));
      }
    }
    return { url };
  }

  private async createMemoryConnection(): Promise<MongoConnection & OnApplicationShutdown> {
    // prevent mongodb-memory-server from being included in the production bundle
    const { MongoMemoryReplSet } = await import('mongodb-memory-server');
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    return {
      onApplicationShutdown: async (): Promise<void> => {
        await replSet.stop();
      },
      url: new URL('/test', replSet.getUri())
    };
  }
}
