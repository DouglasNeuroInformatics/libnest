import type { Class } from 'type-fest';
import { z } from 'zod';

import { defineToken } from '../utils/token.utils.js';

export const { VALIDATION_SCHEMA_METADATA_KEY } = defineToken('VALIDATION_SCHEMA_METADATA_KEY');

/**
 * Applies a Zod validation schema to a target class using Reflect metadata.
 * @param target The class to apply the schema to.
 * @param schema The Zod schema to apply.
 */
export function applyValidationSchema<T extends z.ZodType<{ [key: string]: unknown }>>(
  target: Class<z.TypeOf<T>>,
  schema: T
) {
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
    throw new Error(`Schema for '${target.name}' must be defined!`);
  } else if (!(schema instanceof z.ZodType)) {
    throw new Error(`Schema for '${target.name}' must be instance of ZodType`);
  }
  return schema;
}

/**
 * Decorator to define the Zod validation schema for DTO classes
 * @param schema The Zod schema to use for validation.
 * @returns A class decorator that applies the schema.
 */
export function ValidationSchema<T extends z.ZodType<{ [key: string]: unknown }>>(schema: T) {
  return (target: Class<z.TypeOf<T>>) => {
    applyValidationSchema(target, schema);
  };
}
