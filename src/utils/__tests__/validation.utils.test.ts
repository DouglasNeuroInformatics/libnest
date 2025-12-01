import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { parseRequestBody } from '../validation.utils.js';

describe('parseRequestBody', () => {
  it('should throw a BadRequestException if the input value cannot be parsed', async () => {
    await expect(parseRequestBody('', z.number())).rejects.toThrow(BadRequestException);
  });
  it('should return the output of the parse result if successful', async () => {
    const value = await parseRequestBody('1', z.coerce.number());
    expect(value).toBe(1);
  });
});
