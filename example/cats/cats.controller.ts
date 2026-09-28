import { Body, Controller, Get, Post } from '@nestjs/common';

import { CatsService } from './cats.service.js';
import { $Cat, $CreateCatData } from './schemas/cat.schema.js';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() data: $CreateCatData): Promise<$Cat> {
    return this.catsService.create(data);
  }

  @Get()
  async findAll(): Promise<$Cat[]> {
    return this.catsService.findAll();
  }
}
