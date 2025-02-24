import { ExceptionBuilder } from '@douglasneuroinformatics/libjs';
import { z } from 'zod';

export const EnvironmentSchemaValidationError = new ExceptionBuilder()
  .setParams({
    message: 'Failed to Parse Environment Variables',
    name: 'EnvironmentSchemaValidationError'
  })
  .setOptionsType<{ details: { issues: z.ZodIssue[] } }>()
  .build();
