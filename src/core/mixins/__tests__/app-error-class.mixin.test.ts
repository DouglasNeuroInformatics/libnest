import { describe, expect, expectTypeOf, it } from 'vitest';

import { AppErrorClass, BaseAppError } from '../app-error-class.mixin.js';

describe('BaseAppError', () => {
  it('should have parameters assignable the base error constructor by default', () => {
    expectTypeOf<ConstructorParameters<typeof BaseAppError>>().toMatchTypeOf<ConstructorParameters<typeof Error>>();
  });
});

describe('AppErrorClass', () => {
  it('should create an instance of error with the provided name and message', () => {
    const TestError = AppErrorClass('TestError');
    const error = new TestError('This is a test');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('This is a test');
    expect(error.name).toBe('TestError');
  });

  it('should create distinct error constructors', () => {
    const TestError = AppErrorClass('TestError');
    const OtherError = AppErrorClass('OtherError');
    const e1 = new TestError('This is a test');
    const e2 = new OtherError('This is a test');
    expect(e1).not.toBeInstanceOf(OtherError);
    expect(e2).not.toBeInstanceOf(TestError);
  });

  it('should have parameters assignable to those of the base error constructor by default', () => {
    const TestError = AppErrorClass('TestError');
    expectTypeOf<ConstructorParameters<typeof TestError>>().toMatchTypeOf<ConstructorParameters<typeof Error>>();
    expectTypeOf(new TestError()).toMatchTypeOf<Error>();
  });

  it('should allow creating an error with additional details', () => {
    const TestError = AppErrorClass<{ details: { code: number } }>('TestError');
    const error = new TestError('This is a test', { details: { code: 0 } });
    expect(error.details.code).toBe(0);
    expectTypeOf<ConstructorParameters<typeof TestError>>().toEqualTypeOf<
      [
        message: string,
        options: {
          details: {
            code: number;
          };
        }
      ]
    >();
  });

  it('should allow creating an error with a custom cause', () => {
    const TestError = AppErrorClass<{ cause: Error }>('TestError');
    const error = new TestError('This is a test', { cause: new Error('Test') });
    expect(error.cause.message).toBe('Test');
    expectTypeOf<ConstructorParameters<typeof TestError>>().toEqualTypeOf<
      [
        message: string,
        options: {
          cause: Error;
        }
      ]
    >();
  });
});
