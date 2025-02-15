import { BadRequestException, Injectable } from '@nestjs/common';
import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { getValidationSchema } from '../decorators/validation-schema.decorator.js';

@Injectable()
export class ValidationPipe implements PipeTransform {
  private readonly reflector = new Reflector();

  async transform(value: unknown, { metatype, type }: ArgumentMetadata) {
    if (type !== 'body') {
      return value;
    } else if (!metatype) {
      throw new Error('Metatype must be defined!');
    }

    const schema = getValidationSchema(metatype);

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
