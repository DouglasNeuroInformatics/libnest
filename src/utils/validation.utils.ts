import { BadRequestException } from '@nestjs/common';
import type { Class } from 'type-fest';
import { z } from 'zod';

import { defineToken } from './token.utils.js';

export const { VALIDATION_SCHEMA_METADATA_KEY } = defineToken('VALIDATION_SCHEMA_METADATA_KEY');

/**
 * Applies a Zod validation schema to a target class using Reflect metadata.
 * @param target The class to apply the schema to.
 * @param schema The Zod schema to apply.
 */
export function applyValidationSchema<T extends z.ZodType<{ [key: string]: unknown }>>(
  target: Class<z.TypeOf<T>>,
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
      `Validation schema for '${target.name}' must be defined! Make sure you have defined the Body() argument in the controller as a class, extending DataTransferObject or using the @ValidationSchema decorator, and that you have not imported that class using type-only syntax.`
    );
  } else if (!(schema instanceof z.ZodType)) {
    throw new Error(`Schema for '${target.name}' must be instance of ZodType`);
  }
  return schema;
}

export async function parseRequestBody<TSchema extends z.ZodTypeAny>(
  value: unknown,
  schema: TSchema
): Promise<z.TypeOf<TSchema>> {
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
