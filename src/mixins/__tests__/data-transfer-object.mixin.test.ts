import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod/v4';

import { getValidationSchema } from '../../utils/validation.utils.js';
import { DataTransferObject } from '../data-transfer-object.mixin.js';

describe('DataTransferObject', () => {
  it('should create a class with the expected metadata', () => {
    const $Cat = z.object({
      age: z.union([z.string(), z.number()]).transform(Number),
      breed: z.string()
    });
    const Cat1 = DataTransferObject($Cat);
    expect(getValidationSchema(Cat1)).toBeInstanceOf(z.ZodType);
    const Cat2 = DataTransferObject($Cat.shape);
    expect(getValidationSchema(Cat2)).toBeInstanceOf(z.ZodType);
    expectTypeOf(Cat1.prototype).toMatchTypeOf<{
      age: number;
      breed: string;
    }>();
  });
  it('should create a class with an empty string for the name', () => {
    expect(DataTransferObject({}).name).toBe('');
  });
});
