import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { ApiPropertyOptions } from '@nestjs/swagger';
import { createApiPropertyDecorator } from '@nestjs/swagger/dist/decorators/api-property.decorator.js';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface.js';
import type { Class } from 'type-fest';
import { z } from 'zod/v4';

import { defineToken } from './token.utils.js';

export const { VALIDATION_SCHEMA_METADATA_KEY } = defineToken('VALIDATION_SCHEMA_METADATA_KEY');

export function getJsonSchemaForSwagger(schema: z.ZodType): z.core.JSONSchema.Schema {
  return z.toJSONSchema(schema, {
    io: 'input',
    target: 'draft-7',
    unrepresentable: 'throw'
  }) as z.core.JSONSchema.Schema;
}

export function getSwaggerPropertyMetadata(_schema: z.core.JSONSchema.BaseSchema): ApiPropertyOptions & SchemaObject {
  const schema = _schema as z.core.JSONSchema.Schema;
  switch (schema.type) {
    case 'array': {
      const items = schema.items;
      return {
        items: items && !Array.isArray(items) ? getSwaggerPropertyMetadata(items) : {},
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
        type: 'object'
      };
    }
    case 'string':
      return {
        type: 'string'
      };
    default:
      return {
        properties: {},
        type: 'object'
      };
    // throw new Error(
    //   [
    //     `Unexpected type for JSON schema '${Reflect.get(schema satisfies never, 'type')}' in schema:`,
    //     JSON.stringify(schema, null, 2)
    //   ].join('\n')
    // );
  }
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

/**
 * Applies a Zod validation schema to a target class using Reflect metadata.
 * @param target The class to apply the schema to.
 * @param schema The Zod schema to apply.
 */
export function applyValidationSchema<T extends z.ZodType<{ [key: string]: any }>>(
  target: Class<z.output<T>>,
  schema: T
): void {
  Reflect.defineMetadata(VALIDATION_SCHEMA_METADATA_KEY, schema, target);
}

/**
 * Retrieves the validation schema associated with a given class using metadata reflection.
 *
 * @param target - The class constructor for which the validation schema should be retrieved.
 * @returns The Zod validation schema associated with the provided class.
 */
export function getValidationSchema<T>(target: Class<T>): z.ZodTypeAny {
  const schema: unknown = Reflect.getMetadata(VALIDATION_SCHEMA_METADATA_KEY, target);
  if (!schema) {
    throw new Error(
      [
        target.name === 'Object'
          ? 'Cannot access validation schema metadata on plain object.'
          : `Validation schema for '${target.name}' must be defined.`,
        'Make sure you have defined the Body() argument in the controller as a class, extending DataTransferObject or using the @ValidationSchema decorator, and that you have not imported that class using type-only syntax.'
      ].join(' ')
    );
  } else if (!(schema instanceof z.ZodType)) {
    throw new Error(`Schema for '${target.name}' must be instance of ZodType`);
  }
  return schema;
}

export async function parseRequestBody<TSchema extends z.ZodType>(
  value: unknown,
  schema: TSchema
): Promise<z.output<TSchema>> {
  const result = await schema.safeParseAsync(value);
  if (!result.success) {
    throw new BadRequestException({
      issues: result.error.issues,
      message: 'Validation Error'
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result.data;
}
