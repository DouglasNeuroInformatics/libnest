import { beforeAll, describe, expect, it } from 'vitest';

import { AppErrorClass, BaseAppError } from '../app-error-class.mixin.js';

describe('AppErrorClass', () => {
  let TestError: typeof BaseAppError;

  beforeAll(() => {
    TestError = AppErrorClass();
  });

  it('should create an instance of error with the provided message', () => {
    const error = new TestError('This is a test');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('This is a test');
  });
});
