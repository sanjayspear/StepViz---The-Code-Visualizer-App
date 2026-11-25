import { useSyncExternalStore } from 'react';

/** Phone layout below 900 px wide (spec section 5, Screen 4). */
export const PHONE_QUERY = '(max-width: 899px)';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
