import { beforeEach, describe, expect, it } from 'vitest';

import { MockPrismaClient } from '../../../../testing/mocks/prisma.client.mock.js';
import { PRISMA_CLIENT_TOKEN } from '../prisma.config.js';
import { PrismaModule } from '../prisma.module.js';

describe('PrismaModule', () => {
  let client: any;

  beforeEach(() => {
    client = new MockPrismaClient({ modelNames: ['User'] });
  });

  describe('forRoot', () => {
    it('should register the PRISMA_CLIENT_TOKEN', () => {
      const module = PrismaModule.forRoot({ client, modelNames: [] });
      expect(module.module).toBe(PrismaModule);
      expect(module.providers).toBeDefined();
      expect(module.providers).toContainEqual({
        provide: PRISMA_CLIENT_TOKEN,
        useValue: client
      });
    });
  });

  // describe('forFeature', () => {
  //   it('should register a model provider', () => {
  //     const modelName = 'User';
  //     const modelToken = getModelToken(modelName);

  //     const module = PrismaModule.forFeature(modelName);
  //     expect(module.module).toBe(PrismaModule);
  //     expect(module.providers).toBeDefined();

  //     const provider: any = module.providers?.find((p: any) => p.provide === modelToken);
  //     expect(provider).toBeDefined();
  //     expect(provider?.useFactory).toBeInstanceOf(Function);

  //     const modelInstance = provider?.useFactory(prismaClientMock);
  //     expect(modelInstance).toBe(prismaClientMock.user);
  //   });
  // });

  // describe('forRootAsync', () => {
  //   it('should register PrismaService and PRISMA_CLIENT_TOKEN asynchronously', () => {
  //     const module = PrismaModule.forRootAsync({
  //       inject: [],
  //       useFactory: () => Promise.resolve(prismaClientMock)
  //     });
  //     expect(module.module).toBe(PrismaModule);
  //     expect(module.providers).toBeDefined();
  //     expect(module.exports).toContain(PrismaService);
  //     expect(module.exports).toContain(PRISMA_CLIENT_TOKEN);
  //   });
  // });
});
