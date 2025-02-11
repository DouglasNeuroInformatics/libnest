import type { Class } from 'type-fest';
import type { z } from 'zod';

export const VALIDATION_SCHEMA_METADATA_KEY = 'LIBNEST_VALIDATION_SCHEMA';

export function applyValidationSchema<T extends z.ZodType<{ [key: string]: unknown }>>(
  target: Class<z.TypeOf<T>>,
  schema: T
) {
  Reflect.defineMetadata(VALIDATION_SCHEMA_METADATA_KEY, schema, target);
}

/**
 * Decorator to define the zod validation schema for DTO classes */
export function ValidationSchema<T extends z.ZodType<{ [key: string]: unknown }>>(schema: T) {
  return (target: Class<z.TypeOf<T>>) => {
    applyValidationSchema(target, schema);
  };
}
