import * as path from 'node:path';

import { Controller, Get } from '@nestjs/common';

import { RenderComponent } from '../../src/decorators/render-component.decorator.js';
import { RouteAccess } from '../../src/index.js';

@Controller('ui')
export class UIController {
  @Get()
  @RenderComponent({ filepath: path.resolve(import.meta.dirname, 'components/Counter.tsx') })
  @RouteAccess('public')
  render(): any {
    return {
      initialCount: 1
    };
  }
}
