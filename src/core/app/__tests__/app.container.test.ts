import { beforeEach, describe, expect, it } from 'vitest';

import { AppContainer } from '../app.container.js';

import type { DynamicAppModule } from '../app.types.js';

describe('AppContainer', () => {
  let appContainer: AppContainer;

  beforeEach(() => {
    appContainer = new AppContainer({
      config: {
        API_DEV_SERVER_PORT: 5500,
        API_PROD_SERVER_PORT: 80,
        DEBUG: false,
        MONGO_URI: 'mongodb://localhost:27017',
        NODE_ENV: 'test',
        SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
        THROTTLER_ENABLED: true,
        VERBOSE: false
      },
      module: {} as DynamicAppModule,
      version: '1'
    });
  });

  it('should be defined', () => {
    expect(appContainer).toBeDefined();
  });
});
