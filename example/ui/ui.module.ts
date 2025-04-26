import { Module } from '@nestjs/common';

import { JSXModule } from '../../src/index.js';
import { CatsModule } from '../cats/cats.module.js';
import { UIController } from './ui.controller.js';
import { UIService } from './ui.service.js';

@Module({
  controllers: [UIController],
  imports: [CatsModule, JSXModule],
  providers: [UIService]
})
export class UIModule {}
