import { Injectable } from '@nestjs/common';

import { InjectModel } from '../../src/core/index.js';

import type { MockPrismaModel } from '../../src/testing/mocks/prisma.model.mock.js';
import type { Cat } from './schemas/cat.schema.js';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  constructor(@InjectModel('Cat') private catModel: MockPrismaModel) {}

  async create(cat: Cat): Promise<Cat> {
    return (await this.catModel.create(cat)) as Cat;
  }

  async findAll(): Promise<Cat[]> {
    return (await this.catModel.findMany()) as Cat[];
  }
}
