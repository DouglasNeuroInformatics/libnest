import type { NextFunction, Request, Response } from 'express';

export type DelayOptions = {
  responseDelay: number;
};

export function delay({ responseDelay }: DelayOptions) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    setTimeout(() => {
      next();
    }, responseDelay);
  };
}
