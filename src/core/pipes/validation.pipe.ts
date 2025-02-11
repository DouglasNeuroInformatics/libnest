import { BadRequestException, Injectable } from '@nestjs/common';
import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z } from 'zod';

import { VALIDATION_SCHEMA_METADATA_KEY } from '../decorators/validation-schema.decorator.js';

@Injectable()
export class ValidationPipe implements PipeTransform {
  private readonly reflector = new Reflector();

  async transform(value: unknown, { metatype, type }: ArgumentMetadata) {
    if (type !== 'body') {
      return value;
    } else if (!metatype) {
      throw new Error('Metatype must be defined!');
    }

    const schema: unknown = this.reflector.get(VALIDATION_SCHEMA_METADATA_KEY, metatype);
    if (!schema) {
      throw new Error(`Schema for '${metatype.name}' must be defined!`);
    } else if (!(schema instanceof z.ZodType)) {
      throw new Error(`Schema for '${metatype.name}' must be instance of ZodType`);
    }

    const result = await schema.safeParseAsync(value);
    if (!result.success) {
      throw new BadRequestException({
        issues: result.error.issues,
        message: 'Validation Error'
      });
    }

    return result.data as unknown;
  }
}
