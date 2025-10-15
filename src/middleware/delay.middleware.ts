import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Middleware to introduce an arbitrary delay in the response, which can be useful for testing purposes.
 * @param options - configuration options
 * @param options.responseDelay - the length of delay in milliseconds
 * @returns An Express middleware function.
 */
export function delay({ responseDelay }: { responseDelay: number }) {
  return (_req: FastifyRequest, _res: FastifyReply, next: () => void): void => {
    setTimeout(() => {
      next();
    }, responseDelay);
  };
}
