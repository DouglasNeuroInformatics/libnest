import { Injectable } from '@nestjs/common';

import { ConfigService } from '../config/config.service.js';

@Injectable()
export class PrismaFactory {
  constructor(private readonly configService: ConfigService) {}

  createClient() {
    const mongoUri = this.configService.get('MONGO_URI');
    const dbName = this.configService.get('NODE_ENV');
    const url = new URL(`${mongoUri.href}/data-capture-${dbName}`);
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
  }
}
