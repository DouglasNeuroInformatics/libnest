import { InternalServerErrorException } from '@nestjs/common';
import type { ApiPropertyOptions } from '@nestjs/swagger';
import { createApiPropertyDecorator } from '@nestjs/swagger/dist/decorators/api-property.decorator.js';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js';
import type { Class } from 'type-fest';
import { z } from 'zod/v4';

const JSON_SCHEMA_TYPES = ['string', 'number', 'boolean', 'object', 'array', 'integer', 'null'];

const JSON_SCHEMA_TYPES_WITHOUT_ARRAY_OR_INT = JSON_SCHEMA_TYPES.filter((arg) => arg !== 'array' && arg !== 'integer');

const ANY_SWAGGER_SCHEMA = {
  additionalProperties: false,
  example: null,
  oneOf: [
    ...JSON_SCHEMA_TYPES_WITHOUT_ARRAY_OR_INT.map((type) => ({ type })),
    {
      items: {
        oneOf: JSON_SCHEMA_TYPES_WITHOUT_ARRAY_OR_INT.map((type) => ({ type }))
      },
      type: 'array'
    }
  ],
  type: 'object' as const
} satisfies SchemaObject;

function isTypedZodSchema(schema: z.core.JSONSchema.BaseSchema): schema is z.core.JSONSchema.Schema {
  return JSON_SCHEMA_TYPES.includes(schema.type as z.core.JSONSchema.Schema['type']);
}

export function getJsonSchemaForSwagger(schema: z.ZodType): z.core.JSONSchema.Schema {
  return z.toJSONSchema(schema, {
    io: 'input',
    target: 'draft-7',
    unrepresentable: 'any'
  }) as z.core.JSONSchema.Schema;
}

export function getSwaggerPropertyMetadata(schema: z.core.JSONSchema.BaseSchema): ApiPropertyOptions & SchemaObject {
  if (isTypedZodSchema(schema)) {
    switch (schema.type) {
      case 'array': {
        const items = schema.items;
        return {
          items: items && !Array.isArray(items) ? getSwaggerPropertyMetadata(items) : ANY_SWAGGER_SCHEMA,
          type: 'array'
        };
      }
      case 'boolean':
        return {
          type: 'boolean'
        };
      case 'integer':
        return {
          type: 'integer'
        };
      case 'null':
        return {
          type: 'null'
        };
      case 'number':
        return {
          type: 'number'
        };
      case 'object': {
        const properties: { [key: string]: ApiPropertyOptions & SchemaObject } = {};
        for (const key in schema.properties) {
          properties[key] = getSwaggerPropertyMetadata(schema.properties[key]!);
        }
        return {
          properties,
          required: schema.required,
          type: 'object'
        };
      }
      case 'string':
        return {
          type: 'string'
        };
      default:
        throw new Error(
          `Unexpected type for JSON schema '${Reflect.get(schema satisfies never, 'type')}' in schema: ${JSON.stringify(schema, null, 2)}`
        );
    }
  }
  return ANY_SWAGGER_SCHEMA;
}

export function applySwaggerMetadata<T extends z.ZodType<{ [key: string]: any }>>(
  target: Class<z.output<T>>,
  schema: T
): void {
  const baseSchema = getJsonSchemaForSwagger(schema);
  if (!(baseSchema.type === 'object')) {
    throw new InternalServerErrorException(`Expected schema to be of type 'object', not '${baseSchema.type}'`);
  }
  for (const propertyKey in baseSchema.properties) {
    const propertyMetadata = getSwaggerPropertyMetadata(baseSchema.properties[propertyKey]!);
    createApiPropertyDecorator(propertyMetadata, true)(target.prototype, propertyKey);
  }
}

export { ANY_SWAGGER_SCHEMA, JSON_SCHEMA_TYPES };
