import { Global, Module } from '@nestjs/common';

import { ConfigService } from '../../index.js';

@Global()
@Module({
  exports: [ConfigService],
  providers: [ConfigService]
})
export class ConfigModule {}
