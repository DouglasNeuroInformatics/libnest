import { describe, expect, it, vi } from 'vitest';

import { LIBNEST_VALIDATION_SCHEMA_METADATA_KEY, ValidationSchema } from '../validation-schema.decorator.js';

describe('ValidationSchema', () => {
  it('should attach the schema to a class', () => {
    const $Schema = vi.fn();
    @ValidationSchema($Schema as any)
    class Test {}
    expect(Reflect.getMetadata(LIBNEST_VALIDATION_SCHEMA_METADATA_KEY, Test)).toBe($Schema);
  });
});
