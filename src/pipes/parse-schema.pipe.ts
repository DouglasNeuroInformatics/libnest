import { BadRequestException, Injectable } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

@Injectable()
export class ParseSchemaPipe<T> implements PipeTransform<T> {
  isOptional: boolean;
  schema: Zod.ZodType<T>;

  constructor(options: { isOptional?: boolean; schema: z.ZodType<T> }) {
    this.isOptional = options.isOptional ?? false;
    this.schema = options.schema;
  }

  async transform(value: unknown): Promise<T | undefined> {
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
