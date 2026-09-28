import type { Class, OmitIndexSignature } from 'type-fest';
import { z } from 'zod/v4';

import { applyValidationSchema } from '../utils/validation.utils.js';

/**
 * @deprecated Type the controller parameter as a Zod schema instead (e.g., `@Body() data: $CreateCatData`,
 * where `$CreateCatData` is both a Zod schema and its inferred type). Parameters typed as classes using this
 * decorator are documented as unknown in the API docs.
 */
export function ValidationSchema<T extends z.ZodType<{ [key: string]: any }>>(
  schema: T
): (target: Class<OmitIndexSignature<T['_output']>>) => void;

/**
 * @deprecated Type the controller parameter as a Zod schema instead (e.g., `@Body() data: $CreateCatData`,
 * where `$CreateCatData` is both a Zod schema and its inferred type). Parameters typed as classes using this
 * decorator are documented as unknown in the API docs.
 */
export function ValidationSchema<T extends z.ZodRawShape>(
  shape: T
): (target: Class<OmitIndexSignature<z.ZodObject<T>['_output']>>) => void;

/**
 * Decorator to define the Zod validation schema for DTO classes
 * @param schema The Zod schema to use for validation.
 * @returns A class decorator that applies the schema.
 * @deprecated Type the controller parameter as a Zod schema instead.
 */
export function ValidationSchema(shapeOrSchema: z.ZodRawShape | z.ZodType<{ [key: string]: any }>) {
  const schema = shapeOrSchema instanceof z.ZodType ? shapeOrSchema : z.object(shapeOrSchema);
  return (target: Class<any>): void => {
    applyValidationSchema(target, schema);
  };
}
