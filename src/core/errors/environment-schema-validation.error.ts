import type { z } from 'zod';

import { AppErrorClass } from '../mixins/app-error-class.mixin.js';

export const EnvironmentSchemaValidationError = AppErrorClass<{ details: { issues: z.ZodIssue[] } }>(
  'EnvironmentSchemaValidationError',
  {
    message: 'Failed to Parse Environment Variables'
  }
);
