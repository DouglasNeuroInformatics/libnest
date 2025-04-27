import { Controller, Get } from '@nestjs/common';

import { RouteAccess } from '../src/index.js';

@Controller()
export class AppController {
  @Get()
  @RouteAccess('public')
  index() {
    return 'ehlllo';
  }
}
