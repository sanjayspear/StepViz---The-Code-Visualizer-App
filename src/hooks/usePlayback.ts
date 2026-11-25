// Step-through playback (spec section 3, Behavior).
// - Steps 1..N; opens at step 1.
// - Play advances every 1.5 s at 1x, stops by itself on the last step.
//   Play on the last step restarts from step 1.
// - Back, Next or Restart while playing pause first. Restart stops playback.
// - Speed cycles 0.5x, 1x, 2x.
import { useCallback, useEffect, useState } from 'react';

export const STEP_INTERVAL_MS = 1500;
export const SPEEDS = [0.5, 1, 2] as const;
export type Speed = (typeof SPEEDS)[number];

export function usePlayback(total: number) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const last = Math.max(0, total - 1);

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setIndex((i) => Math.min(i + 1, last)), STEP_INTERVAL_MS / speed);
    return () => window.clearTimeout(t);
  }, [playing, index, speed, last]);

  const next = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, last));
  }, [last]);

  const back = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const restart = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (index >= last) setIndex(0);
    setPlaying(true);
  }, [playing, index, last]);

  /** Jump to a step (pauses first, like the other buttons). */
  const goTo = useCallback(
    (target: number) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(target, last)));
    },
    [last],
  );

  const cycleSpeed = useCallback(() => {
    setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]);
  }, []);

  return {
    index,
    playing,
    speed,
    isFirst: index === 0,
    isLast: index >= last,
    next,
    back,
    restart,
    togglePlay,
    cycleSpeed,
    goTo,
  };
}
