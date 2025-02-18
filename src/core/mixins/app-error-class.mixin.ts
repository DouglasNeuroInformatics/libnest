import type { Simplify } from 'type-fest';

export type AppErrorOptions<TDetails extends { [key: string]: unknown }> = Simplify<
  ErrorOptions & {
    details?: TDetails;
  }
>;

export class BaseAppError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export function AppErrorClass<TDetails extends { [key: string]: unknown }>(name: `${string}Error`) {
  return class extends BaseAppError {
    constructor(message: string, options?: AppErrorOptions<TDetails>) {
      super(message, options);
      this.name = name;
    }
  };
}
