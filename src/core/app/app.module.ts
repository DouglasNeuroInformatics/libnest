import type { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';

import { JSONLogger } from '../logging/json.logger.js';
import { ConfigService } from '../services/config.service.js';
import { CryptoService } from '../services/crypto.service.js';

import type { RuntimeConfig } from '../../user-config.js';

export type ImportedModule = NonNullable<ModuleMetadata['imports']>[number];

export type CreateAppModuleOptions = {
  config: RuntimeConfig;
  imports: ImportedModule[];
  providers: Provider[];
};

export class AppModule {
  static create({ config, imports, providers }: CreateAppModuleOptions): DynamicModule {
    return {
      imports,
      module: AppModule,
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService(config)
        },
        {
          provide: CryptoService,
          useValue: new CryptoService({
            pbkdf2Params: {
              iterations: config.DANGEROUSLY_DISABLE_PBKDF2_ITERATION ? 1 : 100_000
            },
            secretKey: config.SECRET_KEY
          })
        },
        JSONLogger,
        ...providers
      ]
    };
  }
}
