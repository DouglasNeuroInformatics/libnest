import type { NextFunction, Request, Response } from 'express';

import type { Locale } from '../user-types.js';

export function acceptLanguage({
  fallbackLanguage,
  supportedLanguages
}: {
  fallbackLanguage: Locale;
  supportedLanguages: Locale[];
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.locale = req.acceptsLanguages(supportedLanguages) || fallbackLanguage;
    next();
  };
}
