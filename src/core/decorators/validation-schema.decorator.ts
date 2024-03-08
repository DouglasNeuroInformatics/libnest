import type { Class } from 'type-fest';
import type { ZodType } from 'zod';

/**
 * Decorator to define the zod validation schema for DTO classes */
export function ValidationSchema<T>(schema: ZodType<T>) {
  return (target: Class<T>) => {
    Reflect.defineMetadata('ValidationSchema', schema, target);
  };
}
