import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ParseSchemaPipe } from '../parse-schema.pipe.js';

describe('ParseSchemaPipe', () => {
  it('should validate and return the transformed value', async () => {
    const schema = z.object({ name: z.string() });
    const pipe = new ParseSchemaPipe({ schema });
    const value = { name: 'John Doe' };
    await expect(pipe.transform(value)).resolves.toEqual(value);
  });

  it('should throw BadRequestException if validation fails', async () => {
    const schema = z.object({ age: z.number() });
    const pipe = new ParseSchemaPipe({ schema });
    const invalidValue = { age: 'not-a-number' };
    await expect(pipe.transform(invalidValue)).rejects.toThrow(BadRequestException);
  });

  it('should include validation errors in the exception', async () => {
    const schema = z.object({ age: z.number() });
    const pipe = new ParseSchemaPipe({ schema });
    const invalidValue = { age: 'not-a-number' };
    await expect(pipe.transform(invalidValue)).rejects.toMatchObject({
      cause: expect.any(Array),
      message: 'Validation Failed'
    });
  });

  it('should return undefined if value is optional and undefined', async () => {
    const schema = z.object({ name: z.string() });
    const pipe = new ParseSchemaPipe({ isOptional: true, schema });
    await expect(pipe.transform(undefined)).resolves.toBeUndefined();
  });

  it('should validate correctly even when optional is set to true', async () => {
    const schema = z.object({ name: z.string() });
    const pipe = new ParseSchemaPipe({ isOptional: true, schema });
    const validValue = { name: 'John Doe' };
    await expect(pipe.transform(validValue)).resolves.toEqual(validValue);
  });

  it('should throw an error if value is required but not provided', async () => {
    const schema = z.object({ name: z.string() });
    const pipe = new ParseSchemaPipe({ isOptional: false, schema });
    await expect(pipe.transform(undefined)).rejects.toThrow(BadRequestException);
  });
});
