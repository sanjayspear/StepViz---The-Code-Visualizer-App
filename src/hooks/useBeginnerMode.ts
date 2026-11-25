// "Beginner mode: on" shows the "In real life" box; off hides it.
// The choice is remembered for the next visit (browser storage may be
// unavailable, e.g. in a private window, so every access is guarded).
import { useCallback, useState } from 'react';

const KEY = 'stepviz.beginnerMode';

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function useBeginnerMode() {
  const [on, setOn] = useState(read);
  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(KEY, next ? 'on' : 'off');
      } catch {
        // Not saved; the setting still applies for this visit.
      }
      return next;
    });
  }, []);
  return [on, toggle] as const;
}
