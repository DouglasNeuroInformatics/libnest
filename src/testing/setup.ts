import * as path from 'node:path';

import { vi } from 'vitest';

import 'reflect-metadata';

process.loadEnvFile(path.resolve(import.meta.dirname, '../../.env.example'));

vi.mock('@prisma/client', async () => {
  // syntax to avoid knip false positive
  const { Prisma, PrismaClient } = await import('./mocks/prisma.module.mock.js');
  return { Prisma, PrismaClient };
});
