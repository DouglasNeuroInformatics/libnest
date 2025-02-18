import type { Simplify } from 'type-fest';

export type AppErrorType<TDetails extends undefined | { [key: string]: unknown }> = TDetails extends {
  [key: string]: unknown;
}
  ? new (
      message: string,
      options: Simplify<ErrorOptions & { details: TDetails }>
    ) => Simplify<
      Error & {
        details: TDetails;
      }
    >
  : new (message?: string, options?: ErrorOptions) => Error;

export class BaseAppError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export function AppErrorClass<TDetails extends undefined | { [key: string]: unknown } = undefined>(
  name: `${string}Error`
) {
  return class extends BaseAppError {
    details?: TDetails;

    constructor(message?: string, options?: ErrorOptions & { details?: TDetails }) {
      super(message, options);
      this.name = name;
      this.details = options?.details;
    }
  } as unknown as AppErrorType<TDetails>;
}
