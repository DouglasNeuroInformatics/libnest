import { Test, TestingModule } from '@nestjs/testing';
import type { OmitDeep, PartialDeep } from 'type-fest';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { delay } from '../../middleware/delay.middleware.js';
import { ConfigService } from '../../modules/config/config.service.js';
import { CryptoService } from '../../services/crypto.service.js';
import { AppModule } from '../app.module.js';

import type { CryptoOptions } from '../../services/crypto.service.js';
import type { CreateAppModuleOptions } from '../app.module.js';

vi.mock(import('../../middleware/delay.middleware.js'), async (importOriginal) => {
  const { delay } = await importOriginal();
  return {
    delay: vi.fn(delay)
  };
});

vi.mock('../../services/crypto.service.js', async (importOriginal) => {
  const { CryptoService } = await importOriginal<typeof import('../../services/crypto.service.js')>();
  return {
    CryptoService: vi.fn((options: CryptoOptions) => new CryptoService(options))
  };
});

const createAppModule = ({
  config,
  imports = [],
  providers = []
}: PartialDeep<OmitDeep<CreateAppModuleOptions, 'config.MONGO_URI'>> = {}) => {
  return AppModule.create({
    config: {
      API_DEV_SERVER_PORT: 5500,
      API_PROD_SERVER_PORT: 80,
      DEBUG: false,
      MONGO_URI: new URL('mongodb://localhost:27017'),
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
    describe('default configuration', () => {
      let moduleRef: TestingModule;

      beforeAll(async () => {
        moduleRef = await createModuleRef();
      });

      it('should provide the ConfigService', () => {
        expect(moduleRef.get(ConfigService)).toBeDefined();
      });

      it('should provide the CryptoService with the default number of pbkdf2 iterations', () => {
        expect(moduleRef.get(CryptoService)).toBeDefined();
        expect(CryptoService).toHaveBeenLastCalledWith(
          expect.objectContaining({
            pbkdf2Params: {
              iterations: 100_000
            }
          })
        );
      });

      it('should not call the delay middleware by default', () => {
        expect(delay).not.toHaveBeenCalled();
      });
    });

    describe('custom configuration', () => {
      let moduleRef: TestingModule;

      beforeAll(async () => {
        moduleRef = await createModuleRef({
          config: {
            API_RESPONSE_DELAY: 10,
            DANGEROUSLY_DISABLE_PBKDF2_ITERATION: true,
            NODE_ENV: 'development'
          }
        });
      });

      it('should provide the CryptoService with pbkdf2 iterations disabled', () => {
        expect(moduleRef.get(CryptoService)).toBeDefined();
        expect(CryptoService).toHaveBeenLastCalledWith(
          expect.objectContaining({
            pbkdf2Params: {
              iterations: 1
            }
          })
        );
      });

      it('should call the delay middleware', async () => {
        const app = moduleRef.createNestApplication();
        await app.init();
        expect(delay).toHaveBeenLastCalledWith({ responseDelay: 10 });
        await app.close();
      });
    });
  });
});
