import { ValidationException } from '@douglasneuroinformatics/libjs';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { GlobalExceptionFilter } from '../../filters/global-exception.filter.js';
import { delay } from '../../middleware/delay.middleware.js';
import { ConfigService } from '../../modules/config/config.service.js';
import { CryptoService } from '../../modules/crypto/crypto.service.js';
import { ValidationPipe } from '../../pipes/validation.pipe.js';
import { $BaseEnv } from '../../schemas/env.schema.js';
import { AppFactory } from '../app.factory.js';

import type { BaseEnv } from '../../schemas/env.schema.js';
import type { CreateAppOptions } from '../app.factory.js';

vi.mock(import('../../middleware/delay.middleware.js'), async (importOriginal) => {
  const { delay } = await importOriginal();
  return {
    delay: vi.fn(delay)
  };
});

vi.mock('../../modules/crypto/crypto.service.js', async (importOriginal) => {
  const { CryptoService } = await importOriginal<typeof import('../../modules/crypto/crypto.service.js')>();
  return {
    CryptoService: vi.fn((options: any) => new CryptoService(options))
  };
});

const defaultEnv = {
  API_PORT: '5500',
  DEBUG: 'false',
  MONGO_URI: 'mongodb://localhost:27017',
  NODE_ENV: 'test',
  SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
  THROTTLER_ENABLED: 'false',
  VERBOSE: 'false'
} satisfies { [K in keyof BaseEnv]?: string };

const defaultAppOptions: CreateAppOptions = {
  envSchema: $BaseEnv,
  prisma: {
    dbPrefix: null
  },
  version: '1'
};

// Helper functions
const setupEnv = (env: typeof defaultEnv) => {
  Object.entries(env).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });
};

const createApp = (options: Partial<CreateAppOptions> = {}) => {
  return AppFactory.create({
    ...defaultAppOptions,
    ...options
  });
};

const createModuleRef = async (options: Partial<CreateAppOptions> = {}) => {
  const app = createApp(options);
  return Test.createTestingModule({
    imports: [app.module]
  }).compile();
};

// Test suites
describe('AppFactory', () => {
  describe('create', () => {
    beforeAll(() => {
      setupEnv(defaultEnv);
    });

    describe('basic configuration', () => {
      it('should create an app with minimal options', () => {
        const app = createApp();

        expect(app).toBeDefined();
        expect(app.module).toBeDefined();
        expect(app.module.imports).toContainEqual(expect.objectContaining({ module: expect.any(Function) }));
        expect(app.module.providers).toContainEqual(
          expect.objectContaining({
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter
          })
        );
        expect(app.module.providers).toContainEqual(
          expect.objectContaining({
            provide: APP_PIPE,
            useClass: ValidationPipe
          })
        );
      });

      it('should create an app with custom providers', () => {
        const customProvider = {
          provide: 'CUSTOM_TOKEN',
          useValue: 'custom value'
        };

        const app = createApp({ providers: [customProvider] });
        expect(app.module.providers).toContainEqual(customProvider);
      });

      it('should create an app with docs configuration', () => {
        const docsConfig = {
          description: 'Test Description',
          path: 'docs/' as const,
          title: 'Test API'
        };

        const app = createApp({ docs: docsConfig });
        expect(app.docs).toEqual(docsConfig);
      });
    });

    describe('conditional features', () => {
      it('should create an app with conditional imports', () => {
        class TestModule {}
        const conditionalModule = {
          module: TestModule,
          when: 'DEBUG' as const
        };

        const app = createApp({ imports: [conditionalModule] });
        expect(app.module.imports).not.toContainEqual(expect.objectContaining({ module: TestModule }));
      });

      it('should create an app with throttler enabled', () => {
        vi.stubEnv('THROTTLER_ENABLED', 'true');

        const app = createApp();

        expect(app.module.imports).toContainEqual(
          expect.objectContaining({
            module: ThrottlerModule
          })
        );
        expect(app.module.providers).toContainEqual(
          expect.objectContaining({
            provide: APP_GUARD,
            useClass: ThrottlerGuard
          })
        );

        vi.stubEnv('THROTTLER_ENABLED', defaultEnv.THROTTLER_ENABLED);
      });
    });

    describe('error handling', () => {
      it('should throw an error if it cannot parse the schema', () => {
        vi.stubEnv('VERBOSE', '1');
        expect(() => createApp()).toThrow(
          expect.objectContaining({
            cause: expect.any(ValidationException),
            message: 'Failed to parse environment config'
          })
        );
        vi.stubEnv('VERBOSE', defaultEnv.VERBOSE);
      });
    });

    describe('service configuration', () => {
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
          vi.stubEnv('API_RESPONSE_DELAY', '10');
          vi.stubEnv('DANGEROUSLY_DISABLE_PBKDF2_ITERATION', 'true');
          vi.stubEnv('NODE_ENV', 'development');
          moduleRef = await createModuleRef();
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

    describe('conditional imports', () => {
      let DebugModule: ReturnType<typeof vi.fn>;
      let init: (debug?: boolean) => Promise<TestingModule>;

      beforeAll(() => {
        DebugModule = vi.fn(() => {
          return {};
        });
        init = (debug?: boolean) => {
          vi.stubEnv('DEBUG', debug?.toString() ?? '');
          return createModuleRef({
            imports: [
              {
                module: DebugModule,
                when: 'DEBUG'
              }
            ]
          });
        };
      });

      it('should not import the DebugModule if debug is undefined', async () => {
        await init();
        expect(DebugModule).not.toHaveBeenCalled();
      });

      it('should not import the DebugModule if debug is false', async () => {
        await init(false);
        expect(DebugModule).not.toHaveBeenCalled();
      });

      it('should import the DebugModule if debug is true', async () => {
        await init(true);
        expect(DebugModule).toHaveBeenCalledOnce();
      });
    });
  });
});
