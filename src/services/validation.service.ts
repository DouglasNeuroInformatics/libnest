import { BadRequestException, Injectable } from '@nestjs/common';
import type { z } from 'zod';

@Injectable()
export class ValidationService {
  async parseAsync<TSchema extends z.ZodTypeAny>(value: unknown, schema: TSchema): Promise<z.TypeOf<TSchema>> {
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
}
