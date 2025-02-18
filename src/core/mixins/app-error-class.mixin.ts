import type { Simplify } from 'type-fest';

type AppErrorOptions = Simplify<
  ErrorOptions & {
    details?: {
      [key: string]: unknown;
    };
  }
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
    constructor(message?: string, options?: TOptions) {
      super(message, options);
      this.name = name;
    }
  };
}
