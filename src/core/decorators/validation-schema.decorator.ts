import type { Class } from 'type-fest';
import type { z } from 'zod';

export const VALIDATION_SCHEMA_METADATA_KEY = 'LIBNEST_VALIDATION_SCHEMA';

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
 * Decorator to define the Zod validation schema for DTO classes
 * @param schema The Zod schema to use for validation.
 * @returns A class decorator that applies the schema.
 */
export function ValidationSchema<T extends z.ZodType<{ [key: string]: unknown }>>(schema: T) {
  return (target: Class<z.TypeOf<T>>) => {
    applyValidationSchema(target, schema);
  };
}
