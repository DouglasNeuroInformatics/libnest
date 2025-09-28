import { BadRequestException, Injectable } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common';
import { z } from 'zod/v4';

@Injectable()
export class UUIDPipe implements PipeTransform<string> {
  private schema = z.uuid();

  transform(value: unknown): string {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return result.data;
  }
}
