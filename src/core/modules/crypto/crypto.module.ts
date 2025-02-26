import { Global, Module } from '@nestjs/common';

import { CryptoService } from './crypto.service.js';

@Global()
@Module({
  exports: [CryptoService],
  providers: [CryptoService]
})
export class CryptoModule {}
