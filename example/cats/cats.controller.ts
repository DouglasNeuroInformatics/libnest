import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { RouteAccess } from '../../src/index.js';
import { CatsService } from './cats.service.js';
import { $Cat, $CreateCatData } from './schemas/cat.schema.js';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @ApiOperation({ summary: 'Create Cat' })
  @Post()
  @RouteAccess({ action: 'create', subject: 'Cat' })
  async create(@Body() data: $CreateCatData): Promise<$Cat> {
    return this.catsService.create(data);
  }

  @ApiOperation({ summary: 'Get All Cats' })
  @Get()
  @RouteAccess({ action: 'read', subject: 'Cat' })
  async findAll(): Promise<$Cat[]> {
    return this.catsService.findAll();
  }
}
