import type { IfNever, RequiredKeysOf, Simplify } from 'type-fest';

type AppErrorOptions = {
  cause?: unknown;
  details?: {
    [key: string]: unknown;
  };
};

type IsAnyOptionDefined<TOptions extends AppErrorOptions> = IfNever<RequiredKeysOf<TOptions>, false, true>;

type AppErrorParams<TOptions extends AppErrorOptions> =
  IsAnyOptionDefined<TOptions> extends true
    ? {
        message: string;
      }
    : never;

type AppErrorInstance<TOptions extends AppErrorOptions> = Simplify<
  Error & {
    cause: TOptions['cause'];
    details: TOptions['details'];
  }
>;

type AppErrorConstructorArgs<TOptions extends AppErrorOptions, TParams extends AppErrorParams<TOptions>> =
  IsAnyOptionDefined<TOptions> extends true
    ? IfNever<TParams, [message: string, options: TOptions], [TOptions]>
    : [message?: string, options?: TOptions];

export type AppErrorConstructor<TOptions extends AppErrorOptions, TParams extends AppErrorParams<TOptions>> = new (
  ...args: AppErrorConstructorArgs<TOptions, TParams>
) => AppErrorInstance<TOptions>;

export abstract class BaseAppError<TOptions extends AppErrorOptions>
  extends Error
  implements AppErrorInstance<TOptions>
{
  override cause: TOptions['cause'];
  details: TOptions['details'];

  constructor(...args: AppErrorConstructorArgs<TOptions, never>) {
    const [message, options] = args;
    super(message);
    this.name = new.target.name;
    this.cause = options?.cause;
    this.details = options?.details;
  }
}

export function AppErrorClass<TOptions extends AppErrorOptions = AppErrorOptions>(
  name: `${string}Error`,
  params: AppErrorParams<TOptions>
): AppErrorConstructor<TOptions, AppErrorParams<TOptions>>;

export function AppErrorClass<TOptions extends AppErrorOptions = AppErrorOptions>(
  name: `${string}Error`
): AppErrorConstructor<TOptions, never>;

export function AppErrorClass<TOptions extends AppErrorOptions = AppErrorOptions>(
  name: `${string}Error`,
  params?: AppErrorParams<TOptions>
) {
  return class extends BaseAppError<TOptions> {
    override name = name;
    constructor(...args: AppErrorConstructorArgs<TOptions, AppErrorParams<TOptions>>) {
      const [message, options] = (params ? [params.message, args[0]] : args) as [string, TOptions];
      super(message, options);
    }
  };
}
