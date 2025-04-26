import { Module } from '@nestjs/common';

import { JSXModule } from '../../src/index.js';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  imports: [JSXModule],
  providers: [CatsService]
})
export class CatsModule {}
