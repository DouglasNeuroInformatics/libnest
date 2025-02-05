import { describe, expect, it } from 'vitest';

import { PrismaModule } from '../prisma.module.js';

describe('PrismaModule', () => {
  describe('forFeature', () => {
    it('should provide the model on the prisma client', () => {
      const modelName = 'Test';
      const module = PrismaModule.forFeature(modelName);
      expect(module.providers?.length).toBe(1);
      const provider = module.providers?.at(0);
      expect(provider).toMatchObject({ useFactory: expect.any(Function) });
      expect((provider as any).useFactory({ [modelName.toLowerCase()]: 'MODEL' })).toBe('MODEL');
    });
  });
});
