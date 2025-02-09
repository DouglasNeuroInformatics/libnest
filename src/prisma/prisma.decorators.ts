import { Inject } from '@nestjs/common';

import { getModelToken } from './prisma.utils.js';

import type { PrismaModelName } from '../types.js';

export const InjectModel = <T extends PrismaModelName>(modelName: T): ParameterDecorator & PropertyDecorator => {
  return Inject(getModelToken(modelName));
};
