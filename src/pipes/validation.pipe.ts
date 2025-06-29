import { Injectable } from '@nestjs/common';
import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { z } from 'zod/v4';

import { getValidationSchema, parseRequestBody } from '../utils/validation.utils.js';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype, type }: ArgumentMetadata): Promise<unknown> {
    if (type !== 'body') {
      return value;
    } else if (!metatype) {
      throw new Error('Metatype must be defined!');
    }

    let schema: z.ZodType;
    if (metatype instanceof z.ZodType) {
      schema = metatype;
    } else {
      schema = getValidationSchema(metatype);
    }

    return parseRequestBody(value, schema);
  }
}
