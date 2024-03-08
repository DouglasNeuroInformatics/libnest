import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';

/**
 * Use the provided schema to transform values
 */
@Injectable()
export class ParseSchemaPipe<T> implements PipeTransform<T> {
  isOptional: boolean;
  schema: Zod.ZodType<T>;

  constructor(options: { isOptional?: boolean; schema: Zod.ZodType<T> }) {
    this.isOptional = options.isOptional ?? false;
    this.schema = options.schema;
  }

  async transform(value: unknown) {
    if (this.isOptional && value === undefined) {
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
