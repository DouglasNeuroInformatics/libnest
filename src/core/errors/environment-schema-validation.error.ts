import { z } from 'zod';

import { AppErrorClass } from '../mixins/app-error-class.mixin.js';

export const EnvironmentSchemaValidationError = AppErrorClass({
  message: 'Failed to Parse Environment Variables',
  name: 'EnvironmentSchemaValidationError'
}).extendType<{ details: { issues: z.ZodIssue[] } }>();
