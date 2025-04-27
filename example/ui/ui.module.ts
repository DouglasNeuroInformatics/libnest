import { Module } from '@nestjs/common';

import { CatsModule } from '../cats/cats.module.js';
import { UIController } from './ui.controller.js';

@Module({
  controllers: [UIController],
  imports: [CatsModule]
})
export class UIModule {}
