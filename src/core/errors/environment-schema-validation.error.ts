import { z } from 'zod';

import { AppErrorClass } from '../mixins/app-error-class.mixin.js';

export const EnvironmentSchemaValidationError = AppErrorClass({
  extendType(infer) {
    return infer<{ details: { issues: z.ZodIssue[] } }>();
  },
  message: 'Failed to Parse Environment Variables',
  name: 'EnvironmentSchemaValidationError'
});
