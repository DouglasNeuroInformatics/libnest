import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { ValidationSchema } from '../../decorators/validation-schema.decorator.js';
import { applyValidationSchema } from '../../utils/validation.utils.js';
import { ValidationPipe } from '../validation.pipe.js';

describe('ValidationPipe', () => {
  const validationPipe = new ValidationPipe();

  it('should pass through arguments that are not a body', async () => {
    await expect(validationPipe.transform('PARAM', { type: 'param' })).resolves.toBe('PARAM');
  });

  it('should throw an error if metatype is undefined', async () => {
    await expect(validationPipe.transform({}, { metatype: undefined, type: 'body' })).rejects.toThrow(
      'Metatype must be defined'
    );
  });

  it('should throw an error if the schema is undefined on a class', async () => {
    class Test {
      isTest: boolean;
    }
    await expect(validationPipe.transform({}, { metatype: Test, type: 'body' })).rejects.toThrow(
      "Validation schema for 'Test' must be defined. Make sure you have defined the Body() argument in the controller as a class, extending DataTransferObject or using the @ValidationSchema decorator, and that you have not imported that class using type-only syntax."
    );
  });

  it('should throw an error if the schema is undefined on a plain object', async () => {
    await expect(validationPipe.transform({}, { metatype: Object, type: 'body' })).rejects.toThrow(
      'Cannot access validation schema metadata on plain object. Make sure you have defined the Body() argument in the controller as a class, extending DataTransferObject or using the @ValidationSchema decorator, and that you have not imported that class using type-only syntax.'
    );
  });

  it('should throw an error if the schema is not an instance of ZodType', async () => {
    class Test {
      isTest: boolean;
    }
    applyValidationSchema(Test, {} as any);
    await expect(validationPipe.transform({}, { metatype: Test, type: 'body' })).rejects.toThrow(
      "Schema for 'Test' must be instance of ZodType"
    );
  });

  it('should throw a BadRequestException if the data is invalid', async () => {
    @ValidationSchema(z.object({ isTest: z.boolean() }))
    class Test {
      isTest: boolean;
    }
    await expect(validationPipe.transform({ isTest: '' }, { metatype: Test, type: 'body' })).rejects.toThrow(
      BadRequestException
    );
  });

  it('should return the output data from the schema', async () => {
    @ValidationSchema(z.object({ isTest: z.literal('true').transform((arg) => JSON.parse(arg) as boolean) }))
    class Test {
      isTest: boolean;
    }
    await expect(validationPipe.transform({ isTest: 'true' }, { metatype: Test, type: 'body' })).resolves.toStrictEqual(
      {
        isTest: true
      }
    );
  });
});
