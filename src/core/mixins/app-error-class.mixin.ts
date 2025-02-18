import type { RequiredKeys } from '@prisma/client/runtime/library';
import type { IfNever, Simplify } from 'type-fest';

type AppErrorOptions = Simplify<
  ErrorOptions & {
    details?: {
      [key: string]: unknown;
    };
  }
>;

type AppErrorConstructorArgs<TOptions extends AppErrorOptions> = IfNever<
  RequiredKeys<TOptions>,
  [message?: string, options?: TOptions],
  [message: string, options: TOptions]
>;

export class BaseAppError<TOptions extends AppErrorOptions> extends Error {
  override cause: TOptions['cause'];
  details: TOptions['details'];

  constructor(message?: string, options?: TOptions) {
    super(message, options);
    this.details = options?.details;
  }
}

export function AppErrorClass<TOptions extends AppErrorOptions = AppErrorOptions>(name: `${string}Error`) {
  return class extends BaseAppError<TOptions> {
    constructor(...args: AppErrorConstructorArgs<TOptions>) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...(args as any[]));
      this.name = name;
    }
  };
}
