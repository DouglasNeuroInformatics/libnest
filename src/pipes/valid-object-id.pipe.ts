import { BadRequestException, Injectable } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common';

const VALID_OBJECT_ID = /^[a-fA-F0-9]{24}$/;

@Injectable()
export class ValidObjectIdPipe implements PipeTransform<string> {
  transform(value: unknown): string {
    if (!(typeof value === 'string' && VALID_OBJECT_ID.test(value))) {
      throw new BadRequestException(`Invalid ObjectID: ${String(value)}`);
    }
    return value;
  }
}
