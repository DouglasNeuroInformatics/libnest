import type { IsNever, RequiredKeysOf } from 'type-fest';

type AppErrorOptions = {
  cause?: unknown;
  details?: {
    [key: string]: unknown;
  };
};

type AppErrorParams = {
  message?: string;
  name: `${string}Error`;
};

type AppErrorConstructorArgs<TParams extends AppErrorParams, TOptions extends AppErrorOptions> =
  IsNever<RequiredKeysOf<TOptions>> extends true
    ? [message?: string, options?: TOptions]
    : TParams extends { message: string }
      ? [TOptions]
      : [message: string, options: TOptions];

export type AppErrorInstance<TParams extends AppErrorParams, TOptions extends AppErrorOptions> = Error & {
  cause: TOptions['cause'];
  details: TOptions['details'];
  name: TParams['name'];
};

export type AppErrorConstructor<TParams extends AppErrorParams, TOptions extends AppErrorOptions> = {
  new (...args: AppErrorConstructorArgs<TParams, TOptions>): AppErrorInstance<TParams, TOptions>;
  extendType<TExtendedOptions extends AppErrorOptions>(): AppErrorConstructor<TParams, TExtendedOptions>;
};

export abstract class BaseAppError<TParams extends AppErrorParams, TOptions extends AppErrorOptions>
  extends Error
  implements AppErrorInstance<TParams, TOptions>
{
  public override cause: TOptions['cause'];
  public details: TOptions['details'];
  public override name: TParams['name'];

  constructor(...args: AppErrorConstructorArgs<TParams, TOptions>) {
    const [message, options] = args;
    super(message);
    this.name = new.target.name as TParams['name'];
    this.cause = options?.cause;
    this.details = options?.details;
  }
}

export function AppErrorClass<TParams extends AppErrorParams>(
  params: TParams
): AppErrorConstructor<TParams, AppErrorOptions> {
  return class extends BaseAppError<TParams, AppErrorOptions> {
    override name = params.name;
    constructor(...args: AppErrorConstructorArgs<TParams, AppErrorOptions>) {
      const [message, options] = (params?.message ? [params.message, args[0]] : args) as [string, AppErrorOptions];
      super(message, options);
    }
    static extendType<TOptions extends AppErrorOptions>() {
      return this as AppErrorConstructor<TParams, TOptions>;
    }
  };
}
