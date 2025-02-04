import type { Class } from 'type-fest';
import type { ZodType } from 'zod';

export const VALIDATION_SCHEMA_METADATA_KEY = 'LIBNEST_VALIDATION_SCHEMA';

/**
 * Decorator to define the zod validation schema for DTO classes */
export function ValidationSchema<T>(schema: ZodType<T>) {
  return (target: Class<T>) => {
    Reflect.defineMetadata(VALIDATION_SCHEMA_METADATA_KEY, schema, target);
  };
}
