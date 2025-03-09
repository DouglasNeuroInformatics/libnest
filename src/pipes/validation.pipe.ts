import { Injectable } from '@nestjs/common';
import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';

import { getValidationSchema, parseRequestBody } from '../utils/validation.utils.js';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: unknown, { metatype, type }: ArgumentMetadata) {
    if (type !== 'body') {
      return value;
    } else if (!metatype) {
      throw new Error('Metatype must be defined!');
    }

    const schema = getValidationSchema(metatype);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return parseRequestBody(value, schema);
  }
}
