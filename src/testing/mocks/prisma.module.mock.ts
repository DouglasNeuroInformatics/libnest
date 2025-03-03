import { vi } from 'vitest';

import { MockPrismaClient } from './prisma.client.mock.js';

export const PrismaClient = vi.fn(() => {
  return new MockPrismaClient({
    modelNames: ['Cat']
  });
});

export const Prisma = {
  ModelName: {
    Cat: 'Cat'
  }
};
