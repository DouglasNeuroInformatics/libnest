import { beforeAll, describe, expect, it } from 'vitest';

import { AppErrorClass, BaseAppError } from '../app-error-class.mixin.js';

describe('AppErrorClass', () => {
  let TestError: typeof BaseAppError;

  beforeAll(() => {
    TestError = AppErrorClass('TestError');
  });

  it('should create an instance of error with the provided name and message', () => {
    const error = new TestError('This is a test');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('This is a test');
    expect(error.name).toBe('TestError');
  });

  it('should create distinct error constructors', () => {
    const OtherError = AppErrorClass('OtherError');
    const e1 = new TestError('This is a test');
    const e2 = new OtherError('This is a test');
    expect(e1).not.toBeInstanceOf(OtherError);
    expect(e2).not.toBeInstanceOf(TestError);
  });
});
