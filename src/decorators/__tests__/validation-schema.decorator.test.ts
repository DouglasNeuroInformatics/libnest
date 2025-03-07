import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { VALIDATION_SCHEMA_METADATA_KEY, ValidationSchema } from '../validation-schema.decorator.js';

describe('ValidationSchema', () => {
  it('should attach a schema to a class, if called with a schema', () => {
    const $Schema = z.object({ foo: z.null() });
    @ValidationSchema($Schema)
    class Test {
      foo: null;
    }
    expect(Reflect.getMetadata(VALIDATION_SCHEMA_METADATA_KEY, Test)).toBe($Schema);
  });
  it('should attach a schema to a class, if called with a shape', () => {
    @ValidationSchema({ foo: z.null() })
    class Test {
      foo: null;
    }
    const $Schema = Reflect.getMetadata(VALIDATION_SCHEMA_METADATA_KEY, Test) as z.AnyZodObject;
    expect($Schema).toBeInstanceOf(z.ZodType);
    expect($Schema.shape).toMatchObject({
      foo: expect.any(z.ZodNull)
    });
  });
});
