import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';

import { VALIDATION_SCHEMA_METADATA_KEY } from '../../decorators/validation-schema.decorator.js';
import { DataTransferObject } from '../data-transfer-object.mixin.js';

describe('DataTransferObject', () => {
  it('should create a class with the expected metadata', () => {
    const Cat = DataTransferObject({
      age: z.union([z.string(), z.number()]).transform(Number),
      breed: z.string()
    });
    expect(Reflect.getMetadata(VALIDATION_SCHEMA_METADATA_KEY, Cat)).toBeInstanceOf(z.ZodType);
    expectTypeOf(Cat.prototype).toMatchTypeOf<{
      age: number;
      breed: string;
    }>();
  });
});
