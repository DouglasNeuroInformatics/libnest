import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { ValidationPipe } from '../src/core/index.js';
import { LoggingModule } from '../src/logging/logging.module.js';
import { CatsModule } from './cats/cats.module.js';

@Module({
  imports: [
    CatsModule,
    LoggingModule.forRoot({
      debug: true,
      log: true
    })
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule {}
