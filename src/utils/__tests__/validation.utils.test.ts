import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import {
  applySwaggerMetadata,
  getJsonSchemaForSwagger,
  getSwaggerPropertyMetadata,
  parseRequestBody
} from '../validation.utils.js';

describe('getSwaggerPropertyMetadata', () => {
  const expectSwaggerMetadata = ({ input, output }: { input: z.ZodType; output: SchemaObject }) => {
    expect(getSwaggerPropertyMetadata(getJsonSchemaForSwagger(input))).toStrictEqual(output);
  };

  it('should correctly handle arrays', () => {
    expectSwaggerMetadata({
      input: z.array(z.boolean()),
      output: {
        items: {
          type: 'boolean'
        },
        type: 'array'
      }
    });
  });
  it('should correctly handle booleans', () => {
    expectSwaggerMetadata({
      input: z.boolean(),
      output: {
        type: 'boolean'
      }
    });
  });
  it('should correctly handle integers', () => {
    expectSwaggerMetadata({
      input: z.int(),
      output: {
        type: 'integer'
      }
    });
    expectSwaggerMetadata({
      input: z.number().int(),
      output: {
        type: 'integer'
      }
    });
  });
  it('should correctly handle null', () => {
    expectSwaggerMetadata({
      input: z.null(),
      output: {
        type: 'null'
      }
    });
  });
  it('should correctly handle numbers', () => {
    expectSwaggerMetadata({
      input: z.number(),
      output: {
        type: 'number'
      }
    });
  });
  it('should correctly handle objects', () => {
    expectSwaggerMetadata({
      input: z.object({
        a: z.number(),
        b: z.string()
      }),
      output: {
        properties: {
          a: {
            type: 'number'
          },
          b: {
            type: 'string'
          }
        },
        type: 'object'
      }
    });
  });
  it('should correctly handle strings', () => {
    expectSwaggerMetadata({
      input: z.string(),
      output: {
        type: 'string'
      }
    });
  });
});

describe('applySwaggerMetadata', () => {
  it('should throw an InternalServerErrorException if the schema is not for an object', () => {
    class Target {}
    expect(() => applySwaggerMetadata(Target, z.number() as any)).toThrow(InternalServerErrorException);
  });
});

describe('parseRequestBody', () => {
  it('should throw a BadRequestException if the input value cannot be parsed', async () => {
    await expect(parseRequestBody('', z.number())).rejects.toThrow(BadRequestException);
  });
  it('should return the output of the parse result if successful', async () => {
    const value = await parseRequestBody('1', z.coerce.number());
    expect(value).toBe(1);
  });
});
