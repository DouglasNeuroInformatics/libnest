import { Inject } from '@nestjs/common';

import { ConfigService } from '../config/config.service.js';
import { PRISMA_MODULE_OPTIONS_TOKEN } from './prisma.config.js';

import type { PrismaModuleOptions } from './prisma.config.js';

export type MongoConnectionLike = {
  url: URL;
};

export class MongoConnection implements MongoConnectionLike {
  url: URL;

  constructor(configService: ConfigService, @Inject(PRISMA_MODULE_OPTIONS_TOKEN) { dbPrefix }: PrismaModuleOptions) {
    const mongoUri = configService.get('MONGO_URI');
    const env = configService.get('NODE_ENV');
    const url = new URL(`${mongoUri.href}/${dbPrefix}-${env}`);
    const params = {
      directConnection: configService.get('MONGO_DIRECT_CONNECTION'),
      replicaSet: configService.get('MONGO_REPLICA_SET'),
      retryWrites: configService.get('MONGO_RETRY_WRITES'),
      w: configService.get('MONGO_WRITE_CONCERN')
    };
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.append(key, String(value));
      }
    }
    this.url = url;
  }
}
