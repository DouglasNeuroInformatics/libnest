import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';

import { getValidationSchema } from '../../utils/validation.utils.js';
import { DataTransferObject } from '../data-transfer-object.mixin.js';

describe('DataTransferObject', () => {
  it('should create a class with the expected metadata', () => {
    const Cat = DataTransferObject({
      age: z.union([z.string(), z.number()]).transform(Number),
      breed: z.string()
    });
    expect(getValidationSchema(Cat)).toBeInstanceOf(z.ZodType);
    expectTypeOf(Cat.prototype).toMatchTypeOf<{
      age: number;
      breed: string;
    }>();
  });
});
