import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

import { RouteAccess } from '../../src/index.js';
import { UIService } from './ui.service.js';

@Controller('ui')
export class UIController {
  constructor(private readonly uiService: UIService) {}

  @Get()
  @RouteAccess('public')
  async render(@Res() response: Response): Promise<Response> {
    return this.uiService.render(response);
  }
}
