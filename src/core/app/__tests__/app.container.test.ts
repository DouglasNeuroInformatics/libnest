import { beforeEach, describe, expect, it } from 'vitest';

import { mockEnvConfig } from '../../../testing/mocks/env-config.mock.js';
import { AppContainer } from '../app.container.js';

import type { DynamicAppModule } from '../app.module.js';

describe('AppContainer', () => {
  let appContainer: AppContainer;

  beforeEach(() => {
    appContainer = new AppContainer({
      envConfig: {
        ...mockEnvConfig
      },
      module: {} as DynamicAppModule,
      version: '1'
    });
  });

  it('should be defined', () => {
    expect(appContainer).toBeDefined();
  });
});
