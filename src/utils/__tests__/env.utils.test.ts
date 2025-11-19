import { describe, expect, it } from 'vitest';

import { getInstanceId } from '../env.utils.js';

describe('getInstanceId', () => {
  it('should return a UUID in tests', () => {
    expect(getInstanceId()).toBeTypeOf('string');
  });
});
