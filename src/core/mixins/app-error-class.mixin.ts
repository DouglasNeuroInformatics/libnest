import type { IfNever, RequiredKeysOf } from 'type-fest';

type AppErrorOptions = {
  cause?: unknown;
  details?: {
    [key: string]: unknown;
  };
};

type IsAnyOptionDefined<TOptions extends AppErrorOptions> = IfNever<RequiredKeysOf<TOptions>, false, true>;

type AppErrorParams = {
  extendType?(infer: <TDef extends AppErrorOptions>() => TDef): any;
  message?: string;
  name: `${string}Error`;
};

type AppErrorInstance<TParams extends AppErrorParams, TOptions extends AppErrorOptions> = Error & {
  cause: TOptions['cause'];
  details: TOptions['details'];
  name: TParams['name'];
};

type AppErrorConstructorArgs<TParams extends AppErrorParams, TOptions extends AppErrorOptions> =
  IsAnyOptionDefined<TOptions> extends true
    ? TParams extends { message: string }
      ? [TOptions]
      : [message: string, options: TOptions]
    : [message?: string, options?: TOptions];

export type AppErrorConstructor<TParams extends AppErrorParams, TOptions extends AppErrorOptions> = new (
  ...args: AppErrorConstructorArgs<TParams, TOptions>
) => AppErrorInstance<TParams, TOptions>;

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

export function AppErrorClass<
  TParams extends AppErrorParams,
  TOptions extends NoInfer<TParams> extends {
    extendType: (...args: any[]) => infer TCustomOptions extends AppErrorOptions;
  }
    ? TCustomOptions
    : AppErrorOptions
>(params: TParams): AppErrorConstructor<TParams, TOptions> {
  return class extends BaseAppError<TParams, TOptions> {
    override name = params.name;
    constructor(...args: AppErrorConstructorArgs<TParams, TOptions>) {
      const [message, options] = (params?.message ? [params.message, args[0]] : args) as [string, TOptions];
      super(message, options);
    }
  };
}
