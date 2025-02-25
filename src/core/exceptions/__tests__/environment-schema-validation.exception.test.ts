import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { EnvironmentSchemaValidationException } from '../environment-schema-validation.exception.js';

describe('EnvironmentSchemaValidationException', () => {
  it('should include the correct name and details', () => {
    const issues: z.ZodIssue[] = [{ code: z.ZodIssueCode.custom, message: 'Test', path: [] }];
    const error = new EnvironmentSchemaValidationException({ details: { issues } });
    expect(error.name).toBe('EnvironmentSchemaValidationException');
    expect(error.details.issues).toBe(issues);
  });
});
