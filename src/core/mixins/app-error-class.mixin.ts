import type { Simplify } from 'type-fest';

type AppErrorOptions = Simplify<
  ErrorOptions & {
    details?: {
      [key: string]: unknown;
    };
  }
>;

type AppErrorType<TOptions extends AppErrorOptions> = TOptions extends {
  details: infer TDetails extends { [key: string]: unknown };
}
  ? new (message: string, options: TOptions) => Simplify<Error & { details: TDetails }>
  : new (message?: string, options?: ErrorOptions) => Error;

export class BaseAppError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export function AppErrorClass<TOptions extends AppErrorOptions = ErrorOptions>(name: `${string}Error`) {
  return class extends BaseAppError {
    details?: TOptions['details'];
    constructor(message?: string, options?: TOptions) {
      super(message, options);
      this.name = name;
      this.details = options?.details;
    }
  } as unknown as AppErrorType<TOptions>;
}
