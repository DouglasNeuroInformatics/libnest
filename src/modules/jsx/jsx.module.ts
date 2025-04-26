import { Module } from '@nestjs/common';

import { JSXService } from './jsx.service.js';

@Module({
  exports: [JSXService],
  providers: [JSXService]
})
export class JSXModule {}
