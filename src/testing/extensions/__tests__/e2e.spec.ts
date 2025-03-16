import { RuntimeException } from '@douglasneuroinformatics/libjs';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { err, ok, okAsync } from 'neverthrow';
import { beforeAll, describe, expect, it, test, vi } from 'vitest';
import type { Mock, MockInstance, TestAPI } from 'vitest';

import type { AppContainer } from '../../../app/app.container.js';
import type { MockedInstance } from '../../factories/mock.factory.js';
import type { EndToEndFixtures } from '../e2e.js';

describe('e2e', () => {
  let e2e: TestAPI<EndToEndFixtures>;
  let extend: MockInstance;

  const app = {
    close: vi.fn(),
    flushLogs: vi.fn(),
    init: vi.fn()
  } satisfies Partial<MockedInstance<NestExpressApplication>>;

  const appContainer = {
    getApplicationInstance: vi.fn(() => app)
  } satisfies Partial<MockedInstance<AppContainer>>;

  const metaUtils: Pick<
    {
      [K in keyof typeof import('../../../utils/meta.utils.js')]: Mock<
        (typeof import('../../../utils/meta.utils.js'))[K]
      >;
    },
    'findConfig' | 'loadAppContainer' | 'loadConfig'
  > = {
    findConfig: vi.fn(() => ok('libnest.config.js')),
    loadAppContainer: vi.fn(() => okAsync(appContainer as any)),
    loadConfig: vi.fn(() => okAsync({ entry: vi.fn() }))
  };

  beforeAll(async () => {
    vi.doMock(import('../../../utils/meta.utils.js'), () => metaUtils);
    extend = vi.spyOn(test, 'extend');
    e2e = await import('../e2e.js').then((module) => module.e2e);
  });

  it('should call test.extend', () => {
    expect(extend).toHaveBeenCalled();
  });

  it('should be a function', () => {
    expect(e2e).toBeTypeOf('function');
  });

  it('should provide fixtures for app and api', () => {
    const arg = extend.mock.lastCall![0];
    expect(arg).toStrictEqual({
      api: expect.any(Array),
      app: expect.any(Array)
    });
  });

  it('should setup the api fixture', async () => {
    const app = { getHttpServer: vi.fn() };
    const use = vi.fn();
    const setup = extend.mock.lastCall![0].api[0];
    await setup({ app }, use);
    expect(app.getHttpServer).toHaveBeenCalledOnce();
    expect(use).toHaveBeenCalledOnce();
  });

  it('should setup the app fixture', async () => {
    const use = vi.fn();
    const setup = extend.mock.lastCall![0].app[0];
    await setup({}, use);
    expect(use).toHaveBeenCalledOnce();
    expect(appContainer.getApplicationInstance).toHaveBeenCalledOnce();
    expect(app.init).toHaveBeenCalledOnce();
    expect(app.close).toHaveBeenCalledOnce();
  });

  it('should handle errors while setting up the app fixture', async () => {
    const error = new RuntimeException('Could not find config');
    metaUtils.findConfig.mockReturnValueOnce(err(error));
    const use = vi.fn();
    const setup = extend.mock.lastCall![0].app[0];
    await expect(() => setup({}, use)).rejects.toThrow(error);
  });
});
