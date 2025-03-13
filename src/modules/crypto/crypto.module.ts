import { Global, Module } from '@nestjs/common';

import { ConfigService } from '../config/config.service.js';
import { CryptoService } from './crypto.service.js';

@Global()
@Module({
  exports: [CryptoService],
  providers: [
    {
      inject: [ConfigService],
      provide: CryptoService,
      useFactory: (configService: ConfigService) => {
        return new CryptoService({
          pbkdf2Params: {
            iterations: configService.get('DANGEROUSLY_DISABLE_PBKDF2_ITERATION') ? 1 : 100_000
          },
          secretKey: configService.getOrThrow('SECRET_KEY')
        });
      }
    }
  ]
})
export class CryptoModule {}
