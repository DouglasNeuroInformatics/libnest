import { Inject } from '@nestjs/common';

import { PRISMA_CLIENT_TOKEN } from './prisma.config.js';
import { getModelToken } from './prisma.utils.js';

import type { PrismaModelName } from './prisma.types.js';

export const InjectModel = <T extends PrismaModelName>(modelName: T): ParameterDecorator & PropertyDecorator => {
  return Inject(getModelToken(modelName));
};

export const InjectPrismaClient = (): ParameterDecorator & PropertyDecorator => {
  return Inject(PRISMA_CLIENT_TOKEN);
};
