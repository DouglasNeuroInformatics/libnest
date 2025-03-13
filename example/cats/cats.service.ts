import { Injectable } from '@nestjs/common';

import type { Cat } from './schemas/cat.schema.js';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  async create(cat: Cat): Promise<Cat> {
    this.cats.push(cat);
    return Promise.resolve(cat);
  }

  async findAll(): Promise<Cat[]> {
    return Promise.resolve(this.cats);
  }
}
