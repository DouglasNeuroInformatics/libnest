import type { ConditionalKeys, IfEmptyObject } from 'type-fest';

import type { UserTypes } from './user-config.js';

export type Locale = IfEmptyObject<UserTypes.Locales, string, ConditionalKeys<UserTypes.Locales, true>>;
