import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CatsService } from './cats.service.js';
import { $Cat, $CreateCatData } from './schemas/cat.schema.js';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @ApiOperation({ summary: 'Create Cat' })
  @Post()
  async create(@Body() data: $CreateCatData): Promise<$Cat> {
    return this.catsService.create(data);
  }

  @ApiOperation({ summary: 'Get All Cats' })
  @Get()
  async findAll(): Promise<$Cat[]> {
    return this.catsService.findAll();
  }
}
