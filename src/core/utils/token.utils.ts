import type { SingleKeyMap } from '@douglasneuroinformatics/libjs';

export function defineToken<T extends `${string}`>(s: T): SingleKeyMap<T, `LIBNEST_${T}`> {
  return { [s]: `LIBNEST_${s}` } as SingleKeyMap<T, `LIBNEST_${T}`>;
}
