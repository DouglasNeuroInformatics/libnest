import { Controller, Get } from '@nestjs/common';

import { RouteAccess } from '../../src/index.js';
import { UIService } from './ui.service.js';

@Controller('ui')
export class UIController {
  constructor(private readonly uiService: UIService) {}

  @Get()
  @RouteAccess('public')
  async render(): Promise<string> {
    return this.uiService.render();
  }
}
