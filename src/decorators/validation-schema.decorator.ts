import type { Class } from 'type-fest';
import { z } from 'zod';

import { applyValidationSchema } from '../utils/validation.utils.js';

export function ValidationSchema<T extends z.ZodType<{ [key: string]: any }>>(
  schema: T
): (target: Class<z.output<T>>) => void;

export function ValidationSchema<T extends z.ZodRawShape>(shape: T): (target: Class<z.output<z.ZodObject<T>>>) => void;

/**
 * Decorator to define the Zod validation schema for DTO classes
 * @param schema The Zod schema to use for validation.
 * @returns A class decorator that applies the schema.
 */
export function ValidationSchema(shapeOrSchema: z.ZodRawShape | z.ZodType<{ [key: string]: any }>) {
  const schema = shapeOrSchema instanceof z.ZodType ? shapeOrSchema : z.object(shapeOrSchema);
  return (target: Class<any>): void => {
    applyValidationSchema(target, schema);
  };
}
