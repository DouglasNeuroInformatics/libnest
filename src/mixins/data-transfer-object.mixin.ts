import { IntersectionType } from '@nestjs/swagger';
import type { Class } from 'type-fest';
import { z } from 'zod/v4';

import { applySwaggerMetadata, applyValidationSchema } from '../utils/validation.utils.js';

/**
 * Creates a Data Transfer Object (DTO) class with a Zod schema for validation.
 * @param schema - Zod object schema for the DTO.
 * @returns A DTO class with validation.
 */
export function DataTransferObject<T extends z.ZodType<{ [key: string]: any }>>(schema: T): Class<z.output<T>>;
/**
 * Creates a Data Transfer Object (DTO) class with a Zod schema for validation.
 * @param shape - Zod raw shape for the DTO.
 * @returns A DTO class with validation.
 */
export function DataTransferObject<T extends z.ZodRawShape>(shape: T): Class<z.output<z.ZodObject<T>>>;
/**
 * Creates a Data Transfer Object (DTO) class with a Zod schema for validation.
 * @param shapeOrSchema - Zod raw shape or schema for the DTO.
 * @returns A DTO class with validation.
 */
export function DataTransferObject(shapeOrSchema: z.ZodRawShape | z.ZodType<{ [key: string]: any }>): unknown {
  const schema = shapeOrSchema instanceof z.ZodType ? shapeOrSchema : z.object(shapeOrSchema);
  const Target = class {} as Class<z.output<typeof schema>>;
  applyValidationSchema(Target, schema);
  applySwaggerMetadata(Target, schema);
  return IntersectionType(Target);
}
