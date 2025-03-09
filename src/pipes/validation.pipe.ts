import { Injectable } from '@nestjs/common';
import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';

import { getValidationSchema } from '../decorators/validation-schema.decorator.js';
import { ValidationService } from '../services/validation.service.js';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private readonly validationService: ValidationService) {}

  async transform(value: unknown, { metatype, type }: ArgumentMetadata) {
    if (type !== 'body') {
      return value;
    } else if (!metatype) {
      throw new Error('Metatype must be defined!');
    }

    const schema = getValidationSchema(metatype);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.validationService.parseAsync(value, schema);
  }
}
