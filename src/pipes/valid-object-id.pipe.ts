import { BadRequestException, Injectable } from '@nestjs/common';
import type { PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ValidObjectIdPipe implements PipeTransform<string> {
  transform(value: unknown): string {
    if (!(typeof value === 'string' && ObjectId.isValid(value))) {
      throw new BadRequestException(`Invalid ObjectID: ${String(value)}`);
    }
    return value;
  }
}
