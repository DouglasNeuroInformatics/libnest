import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware to introduce an arbitrary delay in the response, which can be useful for testing purposes.
 * @param options - configuration options
 * @param options.responseDelay - the length of delay in milliseconds
 * @returns An Express middleware function.
 */
export function delay({ responseDelay }: { responseDelay: number }) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    setTimeout(() => {
      next();
    }, responseDelay);
  };
}
