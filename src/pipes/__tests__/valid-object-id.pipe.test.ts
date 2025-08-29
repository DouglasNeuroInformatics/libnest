import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { ValidObjectIdPipe } from '../valid-object-id.pipe.js';

describe('ValidObjectIdPipe', () => {
  it('should return the input value if it is a valid object id', () => {
    const pipe = new ValidObjectIdPipe();
    const value = '68b1e844010c69adcc711123';
    expect(pipe.transform(value)).toEqual(value);
  });
  it('should throw BadRequestException if validation fails', () => {
    const pipe = new ValidObjectIdPipe();
    const value = crypto.randomUUID();
    expect(() => pipe.transform(value)).toThrow(BadRequestException);
  });
});
