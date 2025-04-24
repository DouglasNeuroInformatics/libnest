import type { NextFunction, Request, Response } from 'express';

export function acceptLanguage({
  fallbackLanguage,
  supportedLanguages
}: {
  fallbackLanguage: string;
  supportedLanguages: string[];
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.locale = req.acceptsLanguages(supportedLanguages) || fallbackLanguage;
    next();
  };
}
