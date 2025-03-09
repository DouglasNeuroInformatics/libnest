import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseAsync } from '../validation.utils.js';

describe('parseAsync', () => {
  it('should throw a BadRequestException if the input value cannot be parsed', async () => {
    await expect(parseAsync('', z.number())).rejects.toThrow(BadRequestException);
  });
  it('should return the output of the parse result if successful', async () => {
    const value = await parseAsync('1', z.coerce.number());
    expect(value).toBe(1);
  });
});
