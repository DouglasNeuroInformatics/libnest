import type { Provider } from '@nestjs/common';
import type { PartialDeep } from 'type-fest';
import { describe, expect, it } from 'vitest';

import { AppModule, type CreateAppModuleOptions } from '../app.module.js';

const createAppModule = ({ config, imports = [], providers = [] }: PartialDeep<CreateAppModuleOptions>) => {
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
  });
});
