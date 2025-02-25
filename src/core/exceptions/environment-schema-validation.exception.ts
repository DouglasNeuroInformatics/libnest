import { ExceptionBuilder } from '@douglasneuroinformatics/libjs';
import { z } from 'zod';

export const { EnvironmentSchemaValidationException } = new ExceptionBuilder()
  .setParams({
    message: 'Failed to Parse Environment Variables',
    name: 'EnvironmentSchemaValidationException'
  })
  .setOptionsType<{ details: { issues: z.ZodIssue[] } }>()
  .build();
