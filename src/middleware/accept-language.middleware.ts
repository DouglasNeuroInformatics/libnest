import type { NextFunction, Request, Response } from 'express';

import type { CustomTypeOptions } from '../user-config.js';

export type Locale = CustomTypeOptions extends { Locale: infer TLocale extends string } ? TLocale : string;

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
