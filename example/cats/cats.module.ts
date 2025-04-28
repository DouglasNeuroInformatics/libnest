import { Module } from '@nestjs/common';

import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  controllers: [CatsController],
  exports: [CatsService],
  providers: [CatsService]
})
export class CatsModule {}
