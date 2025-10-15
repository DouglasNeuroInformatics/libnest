import { isNumberLike, parseNumber } from '@douglasneuroinformatics/libjs';
import type { FastifyReply, FastifyRequest } from 'fastify';

import type { UserTypes } from '../user-config.js';

export function acceptLanguage(options: {
  fallbackLanguage: UserTypes.Locale;
  supportedLanguages: UserTypes.Locale[];
}) {
  const { fallbackLanguage, supportedLanguages } = options;
  return (req: FastifyRequest['raw'] & { locale?: UserTypes.Locale }, _res: FastifyReply, next: () => void): void => {
    const header = req.headers['accept-language'];

    let locale: UserTypes.Locale = fallbackLanguage;
    let bestQuality = -1;
    header?.split(',').forEach((lang) => {
      const parts = lang.trim().split(';q=');
      if (!supportedLanguages.includes(parts[0]!)) {
        return;
      }
      const quality = isNumberLike(parts[1]) ? parseNumber(parts[1]) : 1;
      if (quality > bestQuality) {
        bestQuality = quality;
        locale = parts[0]!;
      }
    });

    req.locale = locale;

    next();
  };
}
