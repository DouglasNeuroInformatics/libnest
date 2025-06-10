import type { NextFunction, Request, Response } from 'express';

import type { RuntimeLocale } from '../user-types.js';

export function acceptLanguage({
  fallbackLanguage,
  supportedLanguages
}: {
  fallbackLanguage: RuntimeLocale;
  supportedLanguages: RuntimeLocale[];
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.locale = req.acceptsLanguages(supportedLanguages) || fallbackLanguage;
    next();
  };
}
