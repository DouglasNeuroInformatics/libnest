import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';

import { VIRTUALIZATION_MODULE_OPTIONS_TOKEN } from './virtualization.config.js';
import { VirtualizationService } from './virtualization.service.js';

import type { VirtualizationModuleOptions } from './virtualization.config.js';

@Module({})
export class VirtualizationModule {
  static forRoot(options: VirtualizationModuleOptions): DynamicModule {
    return {
      exports: [VirtualizationService],
      module: VirtualizationModule,
      providers: [
        {
          provide: VIRTUALIZATION_MODULE_OPTIONS_TOKEN,
          useValue: options
        },
        VirtualizationService
      ]
    };
  }
}
