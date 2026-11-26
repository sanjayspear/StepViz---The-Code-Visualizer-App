// Practice progress: which questions are ticked, kept only in this browser (localStorage).
// Only ticks and the day they were ticked are stored, never the student's code.
import { useCallback, useEffect, useState } from 'react';

export const STORAGE_KEY = 'stepviz.practice.v1';

/** How many questions a day the "Today" line counts towards. Change it here. */
export const DAILY_GOAL = 3;

interface Saved {
  version: 1;
  /** question id -> the local date it was ticked ("2026-11-26") */
  solved: Record<string, string>;
}

/** Today's date in the student's own time zone, so the daily count resets at their midnight. */
export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function load(): Saved {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Saved>) : null;
    if (parsed && parsed.version === 1 && parsed.solved && typeof parsed.solved === 'object') {
      const solved: Record<string, string> = {};
      for (const [id, day] of Object.entries(parsed.solved)) if (/^\d+$/.test(id) && typeof day === 'string') solved[id] = day;
      return { version: 1, solved };
    }
  } catch {
    // Storage blocked or broken: start empty (ticks then last for this visit only).
  }
  return { version: 1, solved: {} };
}

function save(data: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage blocked (private browsing): ticks still work for this visit.
  }
}

/** Milliseconds until the next local midnight (plus a second, to be safely past it). */
function untilMidnight(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}

export interface Progress {
  isSolved: (id: number) => boolean;
  setSolved: (id: number, solved: boolean) => void;
  solvedCount: number;
  /** questions ticked today (local time) */
  solvedToday: number;
}

export function usePracticeProgress(): Progress {
  const [data, setData] = useState<Saved>(load);
  const [today, setToday] = useState(localDate);

  // Another tab ticked something: show it here too.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setData(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // The "Today" count starts again at local midnight, also while the page stays open.
  useEffect(() => {
    const t = window.setTimeout(() => setToday(localDate()), untilMidnight());
    return () => window.clearTimeout(t);
  }, [today]);

  const setSolved = useCallback((id: number, solved: boolean) => {
    setData((prev) => {
      const next: Saved = { version: 1, solved: { ...prev.solved } };
      if (solved) next.solved[id] = localDate();
      else delete next.solved[id];
      save(next);
      return next;
    });
  }, []);

  const isSolved = useCallback((id: number) => String(id) in data.solved, [data]);
  const days = Object.values(data.solved);
  return { isSolved, setSolved, solvedCount: days.length, solvedToday: days.filter((d) => d === today).length };
}
