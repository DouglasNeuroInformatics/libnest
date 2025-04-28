import { Controller, Get } from '@nestjs/common';

import { RenderComponent, RouteAccess } from '../src/index.js';
import { CatsService } from './cats/cats.service.js';

import type { CatsProps } from './pages/index.js';

@Controller()
export class AppController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  @RenderComponent({ name: 'index' })
  @RouteAccess('public')
  async render(): Promise<CatsProps> {
    return {
      cats: await this.catsService.findAll()
    };
  }
}
