import { useEffect, useRef } from "react";

const DEFAULT_DELAY_MS = 400;

// Debounce a persisting callback so editors hold their working copy in local state
// And only sync to the metadata store after a typing pause (or on unmount), keeping
// Keystrokes responsive while never dropping the final value.
export const useDebouncedCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number = DEFAULT_DELAY_MS,
): ((...args: Args) => void) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Args | null>(null);

  const flush = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (pending.current !== null) {
      const args = pending.current;
      pending.current = null;
      callbackRef.current(...args);
    }
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => () => flushRef.current(), []);

  return (...args: Args) => {
    pending.current = args;
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(flush, delay);
  };
};
