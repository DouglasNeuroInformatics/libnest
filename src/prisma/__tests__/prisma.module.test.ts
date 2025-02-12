import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PRISMA_CLIENT_TOKEN } from '../prisma.config.js';
import { PrismaModule } from '../prisma.module.js';
import { PrismaService } from '../prisma.service.js';
import { getModelToken } from '../prisma.utils.js';

describe('PrismaModule', () => {
  let prismaClientMock: any;

  beforeEach(() => {
    prismaClientMock = {
      user: {
        create: vi.fn(),
        findMany: vi.fn()
      }
    };
  });

  describe('forFeature', () => {
    it('should register a model provider', () => {
      const modelName = 'User';
      const modelToken = getModelToken(modelName);

      const module = PrismaModule.forFeature(modelName);
      expect(module.module).toBe(PrismaModule);
      expect(module.providers).toBeDefined();

      const provider: any = module.providers?.find((p: any) => p.provide === modelToken);
      expect(provider).toBeDefined();
      expect(provider?.useFactory).toBeInstanceOf(Function);

      const modelInstance = provider?.useFactory(prismaClientMock);
      expect(modelInstance).toBe(prismaClientMock.user);
    });
  });

  describe('forRoot', () => {
    it('should register PrismaService and PRISMA_CLIENT_TOKEN', () => {
      const module = PrismaModule.forRoot(prismaClientMock);
      expect(module.module).toBe(PrismaModule);
      expect(module.providers).toBeDefined();
      expect(module.exports).toContain(PrismaService);
      expect(module.exports).toContain(PRISMA_CLIENT_TOKEN);
    });
  });

  describe('forRootAsync', () => {
    it('should register PrismaService and PRISMA_CLIENT_TOKEN asynchronously', () => {
      const module = PrismaModule.forRootAsync({
        inject: [],
        useFactory: () => Promise.resolve(prismaClientMock)
      });
      expect(module.module).toBe(PrismaModule);
      expect(module.providers).toBeDefined();
      expect(module.exports).toContain(PrismaService);
      expect(module.exports).toContain(PRISMA_CLIENT_TOKEN);
    });
  });
});
