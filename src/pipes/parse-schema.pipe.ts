import { isZodTypeLike } from '@douglasneuroinformatics/libjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common';
import { z } from 'zod/v4';

type LegacyParseSchemaOptions<T> = {
  isOptional?: boolean;
  schema: z.ZodType<T>;
};

@Injectable()
export class ParseSchemaPipe<T> implements PipeTransform<T> {
  private legacyIsOptional: boolean;
  private schema: z.ZodType<T>;

  /* v8 ignore next - doesn't understand overload signature */
  constructor(schema: z.ZodType<T>);
  /** @deprecated - use `new ParseSchemaPipe(schema: z.ZodType) ` */
  constructor(options: LegacyParseSchemaOptions<T>);
  constructor(schemaOrOptions: LegacyParseSchemaOptions<T> | z.ZodType<T>) {
    if (isZodTypeLike(schemaOrOptions)) {
      this.schema = schemaOrOptions;
    } else {
      this.legacyIsOptional = schemaOrOptions.isOptional ?? false;
      this.schema = schemaOrOptions.schema;
    }
  }

  async transform(value: unknown): Promise<T | undefined> {
    if (this.legacyIsOptional && value === undefined) {
      return undefined;
    }
    const result = await this.schema.safeParseAsync(value);
    if (!result.success) {
      throw new BadRequestException('Validation Failed', {
        cause: result.error.issues
      });
    }
    return result.data;
  }
}
