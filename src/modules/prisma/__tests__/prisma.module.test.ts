import { describe, expect, it, vi } from 'vitest';

import { ConfigurablePrismaModule, PRISMA_CLIENT_TOKEN } from '../prisma.config.js';
import { PrismaModule } from '../prisma.module.js';

describe('PrismaModule', () => {
  it('should be defined', () => {
    expect(PrismaModule).toBeDefined();
  });

  it('should extend ConfigurablePrismaModule', () => {
    expect(PrismaModule.prototype).toBeInstanceOf(ConfigurablePrismaModule);
  });

  it('should have Global decorator applied', () => {
    const metadata = Reflect.getMetadata('__module:global__', PrismaModule);
    expect(metadata).toBe(true);
  });

  it('should export PRISMA_CLIENT_TOKEN', () => {
    const exports = Reflect.getMetadata('exports', PrismaModule);
    expect(exports).toBeDefined();
    expect(exports).toContain(PRISMA_CLIENT_TOKEN);
  });

  it('should have model token exports', () => {
    const exports = Reflect.getMetadata('exports', PrismaModule);
    expect(exports).toBeDefined();
    expect(exports.length).toBeGreaterThan(1); // Should have PRISMA_CLIENT_TOKEN + model tokens
  });

  it('should have providers for PRISMA_CLIENT_TOKEN and model tokens', () => {
    const providers = Reflect.getMetadata('providers', PrismaModule);
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should provide model instances from the client', () => {
    const providers = Reflect.getMetadata('providers', PrismaModule);
    const modelProvider = providers.find((p: any) => p.provide === 'CatPrismaModel');
    expect(modelProvider).toBeDefined();

    const mockModel = { name: 'Cat' };
    const mockClient = { cat: mockModel };
    const result = modelProvider.useFactory(mockClient);
    expect(result).toBe(mockModel);
  });

  it('should provide the prisma client from options', () => {
    const providers = Reflect.getMetadata('providers', PrismaModule);
    const clientProvider = providers.find((p: any) => p.provide === PRISMA_CLIENT_TOKEN);
    expect(clientProvider).toBeDefined();

    const mockClient = { cat: vi.fn() };
    const options = { client: mockClient };
    const result = clientProvider.useFactory(options);
    expect(result).toBe(mockClient);
  });
});
