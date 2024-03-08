import { BadRequestException, Injectable, Optional, type PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  coerce: boolean;
  isOptional: boolean;

  constructor(@Optional() options?: { coerce?: boolean; isOptional?: boolean }) {
    this.coerce = options?.coerce ?? false;
    this.isOptional = options?.isOptional ?? false;
  }

  transform(value: unknown) {
    if (this.isOptional && value === undefined) {
      return undefined;
    } else if (!ObjectId.isValid(String(value))) {
      throw new BadRequestException('Value cannot be coerced to object ID: ' + value);
    }
    return this.coerce ? new ObjectId(String(value)) : String(value);
  }
}
