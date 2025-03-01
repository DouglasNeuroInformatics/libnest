import { vi } from 'vitest';
import type { Mock } from 'vitest';

import { getModelRef } from '../../core/modules/prisma/prisma.utils.js';
import { MockPrismaModel } from './prisma.model.mock.js';

import type { PrismaClientLike } from '../../core/modules/prisma/prisma.types.js';

type MockPrismaClientOptions = {
  modelNames: string[];
};

type MockPrismaClientType = new <const TOptions extends MockPrismaClientOptions>(
  options: TOptions
) => {
  [K in TOptions['modelNames'][number] as Uncapitalize<K>]: MockPrismaModel;
} & {
  $connect: Mock;
  $disconnect: Mock;
  $runCommandRaw: Mock;
  [key: string]: unknown;
};

export const MockPrismaClient = class<const TOptions extends MockPrismaClientOptions> implements PrismaClientLike {
  [key: string]: unknown;
  $connect = vi.fn();
  $disconnect = vi.fn();
  $runCommandRaw = vi.fn();

  constructor({ modelNames }: TOptions) {
    modelNames.forEach((modelName) => {
      this[getModelRef(modelName)] = new MockPrismaModel();
    });
  }
} as MockPrismaClientType;
