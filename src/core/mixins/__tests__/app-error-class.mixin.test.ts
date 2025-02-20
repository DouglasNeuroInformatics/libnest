import type { Simplify } from 'type-fest';
import { describe, expect, expectTypeOf, it, test } from 'vitest';

import { AppErrorClass, BaseAppError } from '../app-error-class.mixin.js';

import type { AppErrorConstructor, AppErrorInstance } from '../app-error-class.mixin.js';

type ErrorOptionsWithCode = Simplify<ErrorOptions & { details: { code: number } }>;
type ErrorOptionsWithCause = Simplify<ErrorOptions & { cause: Error }>;
type ErrorOptionsWithCodeAndCause = Simplify<ErrorOptionsWithCause & ErrorOptionsWithCode>;
type ErrorParams = { name: 'TestError' };
type ErrorParamsWithMessage = Simplify<ErrorParams & { message: string }>;

test('AppErrorConstructor', () => {
  expectTypeOf<AppErrorConstructor<ErrorParams, ErrorOptions>>().toEqualTypeOf<
    new (message?: string, options?: ErrorOptions) => AppErrorInstance<ErrorParams, ErrorOptions>
  >();
  expectTypeOf<AppErrorConstructor<ErrorParams, ErrorOptionsWithCode>>().toEqualTypeOf<
    new (message: string, options: ErrorOptionsWithCode) => AppErrorInstance<ErrorParams, ErrorOptionsWithCode>
  >();
  expectTypeOf<AppErrorConstructor<ErrorParams, ErrorOptionsWithCause>>().toEqualTypeOf<
    new (message: string, options: ErrorOptionsWithCause) => AppErrorInstance<ErrorParams, ErrorOptionsWithCause>
  >();
  expectTypeOf<AppErrorConstructor<ErrorParams, ErrorOptionsWithCodeAndCause>>().toEqualTypeOf<
    new (
      message: string,
      options: ErrorOptionsWithCodeAndCause
    ) => AppErrorInstance<ErrorParams, ErrorOptionsWithCodeAndCause>
  >();
  expectTypeOf<AppErrorConstructor<ErrorParamsWithMessage, ErrorOptionsWithCodeAndCause>>().toEqualTypeOf<
    new (
      options: ErrorOptionsWithCodeAndCause
    ) => AppErrorInstance<ErrorParamsWithMessage, ErrorOptionsWithCodeAndCause>
  >();
});

describe('BaseAppError', () => {
  it('should have parameters assignable the base error constructor by default', () => {
    expectTypeOf<ConstructorParameters<typeof BaseAppError>>().toMatchTypeOf<ConstructorParameters<typeof Error>>();
  });
});

describe('AppErrorClass', () => {
  it('should create an instance of error with the provided name and message', () => {
    const TestError = AppErrorClass({ name: 'TestError' });
    const error = new TestError('This is a test');
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('This is a test');
    expect(error.name).toBe('TestError');
  });

  it('should create distinct error constructors', () => {
    const TestError = AppErrorClass({ name: 'TestError' });
    const OtherError = AppErrorClass({ name: 'OtherError' });
    const e1 = new TestError('This is a test');
    const e2 = new OtherError('This is a test');
    expect(e1).not.toBeInstanceOf(OtherError);
    expect(e2).not.toBeInstanceOf(TestError);
  });

  it('should have parameters assignable to those of the base error constructor by default', () => {
    const TestError = AppErrorClass({ name: 'TestError' });
    expectTypeOf<ConstructorParameters<typeof TestError>>().toMatchTypeOf<ConstructorParameters<typeof Error>>();
    expectTypeOf(new TestError()).toMatchTypeOf<Error>();
  });

  it('should allow creating an error with additional details', () => {
    const TestError = AppErrorClass({
      extendType(infer) {
        return infer<{ details: { code: number } }>();
      },
      name: 'TestError'
    });
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
    const TestError = AppErrorClass({
      extendType(infer) {
        return infer<{ cause: Error }>();
      },
      name: 'TestError'
    });
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

  it('should allow creating an error with a default message', () => {
    const TestError = AppErrorClass({
      extendType(infer) {
        return infer<{ cause: Error }>();
      },
      message: 'Custom message',
      name: 'TestError'
    });
    const error = new TestError({ cause: new Error('Test') });
    expect(error.message).toBe('Custom message');
    expectTypeOf<ConstructorParameters<typeof TestError>>().toEqualTypeOf<
      [
        options: {
          cause: Error;
        }
      ]
    >();
  });
});
