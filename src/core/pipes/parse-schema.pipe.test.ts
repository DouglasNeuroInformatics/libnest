import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ParseSchemaPipe } from './parse-schema.pipe.js';

describe('ParseSchema', () => {
  let pipe: ParseSchemaPipe<any>;

  beforeEach(() => {
    pipe = new ParseSchemaPipe({
      schema: z.number()
    });
  });

  it('should create the pipe', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should return the value if it is valid according to the schema', async () => {
      const result = await pipe.transform(1);
      expect(result).toBe(1);
    });
  });
});
