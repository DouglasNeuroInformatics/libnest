import type { ModuleMetadata } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { ConfigModule } from '../../config/config.module.js';
import { GlobalExceptionFilter } from '../filters/global-exception.filter.js';
import { ValidationPipe } from '../pipes/validation.pipe.js';

import type { ConfigSchema } from '../../config/config.module.js';
import type { internalModuleTag } from './internal-module.factory.js';

type ImportedModule = NonNullable<ModuleMetadata['imports']>[number] & {
  [internalModuleTag]?: never;
};

type CreateAppOptions = {
  imports: ImportedModule[];
  schema: ConfigSchema;
};

class AppModule {}

export class AppFactory {
  static createModule({ imports, schema }: CreateAppOptions) {
    return {
      imports: [
        ConfigModule.forRoot({
          schema
        }),
        ...imports
      ],
      module: AppModule,
      providers: [
        {
          provide: APP_FILTER,
          useClass: GlobalExceptionFilter
        },
        {
          provide: APP_PIPE,
          useClass: ValidationPipe
        }
      ]
    };
  }
}

export type { CreateAppOptions };
