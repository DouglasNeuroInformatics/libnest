import { InternalServerErrorException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import {
  ANY_SWAGGER_SCHEMA,
  applySwaggerMetadata,
  getJsonSchemaForSwagger,
  getSwaggerPropertyMetadata,
  JSON_SCHEMA_TYPES
} from '../swagger.utils.js';

describe('getSwaggerPropertyMetadata', () => {
  const expectSwaggerMetadata = ({ input, output }: { input: z.ZodType; output: SchemaObject }) => {
    expect(getSwaggerPropertyMetadata(getJsonSchemaForSwagger(input))).toStrictEqual(output);
  };

  const expectMetadataEqualAndNotEmpty = (a: object, b: object) => {
    const keysA = Reflect.getMetadataKeys(a);
    const keysB = Reflect.getMetadataKeys(b);
    expect(keysA.length).toBeGreaterThanOrEqual(1);
    expect(keysA).toStrictEqual(keysB);
    keysA.forEach((key) => {
      const valueA = Reflect.getMetadata(key, a);
      const valueB = Reflect.getMetadata(key, b);
      expect(valueA).toBeDefined();
      expect(valueA).toStrictEqual(valueB);
    });
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
    expectSwaggerMetadata({
      input: z.array(z.boolean().nullish()),
      output: {
        items: ANY_SWAGGER_SCHEMA,
        type: 'array'
      }
    });
    // I have no idea when (or if) this is possible, but test it just in case
    vi.spyOn(Array, 'isArray').mockReturnValueOnce(true);
    expectSwaggerMetadata({
      input: z.array(z.boolean().nullish()),
      output: {
        items: ANY_SWAGGER_SCHEMA,
        type: 'array'
      }
    });
  });
  it('should correctly handle tuples', () => {
    expectSwaggerMetadata({
      input: z.tuple([z.string(), z.number()]),
      output: {
        items: ANY_SWAGGER_SCHEMA,
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
        b: z.string().optional()
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
        required: ['a'],
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
  it('should generate the same metadata as using swagger decorators', () => {
    class Swagger {
      @ApiProperty()
      name: string;
    }

    const $Schema = z.object({ name: z.string() });
    class Zod {
      name: string;
    }

    applySwaggerMetadata(Zod, $Schema);

    expectMetadataEqualAndNotEmpty(Swagger.prototype, Zod.prototype);
  });
  it('should throw if for any reason the schema has an invalid type, but passes the type guard', () => {
    vi.spyOn(JSON_SCHEMA_TYPES, 'includes').mockReturnValueOnce(true);
    expect(() => getSwaggerPropertyMetadata({ type: 'UNKNOWN' })).toThrow();
  });
});

describe('applySwaggerMetadata', () => {
  it('should throw an InternalServerErrorException if the schema is not for an object', () => {
    class Target {}
    expect(() => applySwaggerMetadata(Target, z.number() as any)).toThrow(InternalServerErrorException);
  });
});
