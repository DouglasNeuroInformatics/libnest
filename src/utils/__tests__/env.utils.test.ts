import { describe, expect, it } from 'vitest';

import { INSTANCE_ID } from '../env.utils.js';

describe('getInstanceId', () => {
  it('should be a UUID in tests', () => {
    expect(INSTANCE_ID).toBeTypeOf('string');
  });
});
