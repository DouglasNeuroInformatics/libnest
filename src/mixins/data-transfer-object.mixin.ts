import type { Class } from 'type-fest';
import { z } from 'zod';

import { applyValidationSchema } from '../utils/validation.utils.js';

/**
 * Creates a Data Transfer Object (DTO) class with a Zod schema for validation.
 * @param schema - Zod object schema for the DTO.
 * @returns A DTO class with validation.
 */
export function DataTransferObject<T extends z.ZodType<{ [key: string]: any }>>(schema: T): Class<z.TypeOf<T>>;
/**
 * Creates a Data Transfer Object (DTO) class with a Zod schema for validation.
 * @param shape - Zod raw shape for the DTO.
 * @returns A DTO class with validation.
 */
export function DataTransferObject<T extends z.ZodRawShape>(shape: T): Class<z.TypeOf<z.ZodObject<T>>>;
/**
 * Creates a Data Transfer Object (DTO) class with a Zod schema for validation.
 * @param shapeOrSchema - Zod raw shape or schema for the DTO.
 * @returns A DTO class with validation.
 */
export function DataTransferObject(shapeOrSchema: z.ZodRawShape | z.ZodType<{ [key: string]: any }>): unknown {
  const schema = shapeOrSchema instanceof z.ZodType ? shapeOrSchema : z.object(shapeOrSchema);
  const Target = class {} as Class<z.TypeOf<typeof schema>>;
  applyValidationSchema(Target, schema);
  return Target;
}
