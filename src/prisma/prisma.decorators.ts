import { Inject } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { getModelToken } from './prisma.utils.js';

export const InjectModel = <T extends Prisma.ModelName>(modelName: T): ParameterDecorator & PropertyDecorator => {
  return Inject(getModelToken(modelName));
};
