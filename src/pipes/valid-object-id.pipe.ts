import { BadRequestException, Injectable } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidObjectIdPipe implements PipeTransform<string> {
  transform(value: unknown): string {
    if (!(typeof value === 'string' && /^[0-9a-f]{24}$/.test(value))) {
      throw new BadRequestException(`Invalid ObjectID: ${String(value)}`);
    }
    return value;
  }
}
