import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';

@Module({})
export class PrismaModule {
  static forRoot(): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: 'TOKEN',
          useValue: 'foo'
        }
      ]
    };
  }
}
