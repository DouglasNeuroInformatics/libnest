import type { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

import { getModelKey } from '../../modules/prisma/prisma.utils.js';
import { MockPrismaModel } from './prisma.model.mock.js';

type MockPrismaClientOptions = {
  modelNames: string[];
};

type MockPrismaClientInstance<TOptions extends MockPrismaClientOptions = MockPrismaClientOptions> = {
  [K in TOptions['modelNames'][number] as Uncapitalize<K>]: MockPrismaModel;
} & {
  $connect: Mock;
  $disconnect: Mock;
  $runCommandRaw: Mock;
  [key: string]: unknown;
  __isMockPrismaClient: true;
};

type MockPrismaClientConstructor = new <const TOptions extends MockPrismaClientOptions>(
  options: TOptions
) => MockPrismaClientInstance<TOptions>;

export const MockPrismaClient = class<const TOptions extends MockPrismaClientOptions> implements Partial<PrismaClient> {
  [key: PropertyKey]: any;
  $connect = vi.fn();
  $disconnect = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  $extends = vi.fn().mockReturnThis() as any;
  $runCommandRaw = vi.fn();
  __isMockPrismaClient = true;

  constructor({ modelNames }: TOptions) {
    modelNames.forEach((modelName) => {
      this[getModelKey(modelName)] = new MockPrismaModel();
    });
  }
} as MockPrismaClientConstructor;

export type { MockPrismaClientInstance };
