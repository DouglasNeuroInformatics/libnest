import type { SingleKeyMap } from '@douglasneuroinformatics/libjs';

export function defineToken<T extends `LIBNEST_${string}`>(s: T): SingleKeyMap<T, T> {
  return { [s]: s } as SingleKeyMap<T, T>;
}
