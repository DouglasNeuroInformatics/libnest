import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { EnvironmentSchemaValidationError } from '../environment-schema-validation.error.js';

describe('EnvironmentSchemaValidationError', () => {
  it('should include the correct name and details', () => {
    const issues: z.ZodIssue[] = [{ code: z.ZodIssueCode.custom, message: 'Test', path: [] }];
    const error = new EnvironmentSchemaValidationError({ details: { issues } });
    expect(error.name).toBe('EnvironmentSchemaValidationError');
    expect(error.details.issues).toBe(issues);
  });
});
