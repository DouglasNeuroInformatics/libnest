import type { Provider } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PartialDeep } from 'type-fest';
import { describe, expect, it, vi } from 'vitest';

import { ConfigService } from '../../services/config.service.js';
import { type CryptoOptions, CryptoService } from '../../services/crypto.service.js';
import { AppModule, type CreateAppModuleOptions } from '../app.module.js';

vi.mock('../../services/crypto.service.js', async (importOriginal) => {
  const { CryptoService } = await importOriginal<typeof import('../../services/crypto.service.js')>();
  return {
    CryptoService: vi.fn((options: CryptoOptions) => new CryptoService(options))
  };
});

const createAppModule = ({ config, imports = [], providers = [] }: PartialDeep<CreateAppModuleOptions> = {}) => {
  return AppModule.create({
    config: {
      API_DEV_SERVER_PORT: 5500,
      API_PROD_SERVER_PORT: 80,
      DEBUG: false,
      MONGO_URI: 'mongodb://localhost:27017',
      NODE_ENV: 'test',
      SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
      THROTTLER_ENABLED: true,
      VERBOSE: false,
      ...config
    },
    imports,
    providers
  });
};

const createModuleRef = (options?: PartialDeep<CreateAppModuleOptions>) => {
  return Test.createTestingModule({
    imports: [createAppModule(options)]
  }).compile();
};

describe('AppModule', () => {
  describe('create', () => {
    it('should provide user-specified imports and providers', () => {
      class DummyModule {}
      const dummyProvider: Provider = {
        provide: 'DUMMY_MODULE_OPTIONS',
        useValue: 'DUMMY_MODULE_OPTIONS_VALUE'
      };
      const module = createAppModule({
        imports: [DummyModule],
        providers: [dummyProvider]
      });
      expect(module.imports).toContain(DummyModule);
      expect(module.providers).toContain(dummyProvider);
    });

    it('should provide the ConfigService', async () => {
      const moduleRef = await createModuleRef();
      expect(moduleRef.get(ConfigService)).toBeDefined();
    });

    it('should provide the CryptoService', async () => {
      await createModuleRef();
      expect(CryptoService).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pbkdf2Params: {
            iterations: 100_000
          }
        })
      );
      await createModuleRef({
        config: {
          DANGEROUSLY_DISABLE_PBKDF2_ITERATION: true
        }
      });
      expect(CryptoService).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pbkdf2Params: {
            iterations: 1
          }
        })
      );
    });
  });
});
