import { Module } from '@nestjs/common';

import { ConfigurableCryptoModule } from './crypto.config.js';
import { CryptoService } from './crypto.service.js';

@Module({
  exports: [CryptoService],
  providers: [CryptoService]
})
export class CryptoModule extends ConfigurableCryptoModule {}
