import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ValidationService } from '../validation.service.js';

describe('ValidationService', () => {
  const validationService = new ValidationService();

  it('should throw a BadRequestException if the input value cannot be parsed', async () => {
    await expect(validationService.parseAsync('', z.number())).rejects.toThrow(BadRequestException);
  });

  it('should return the output of the parse result if successful', async () => {
    const value = await validationService.parseAsync('1', z.coerce.number());
    expect(value).toBe(1);
  });
});
