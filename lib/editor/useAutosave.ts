"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export type AutosaveResult = {
  status: AutosaveStatus;
  error: string | null;
};

/**
 * Debounced autosave. Calls `save(value)` `delayMs` after the last change.
 * Skips the initial mount. If a save is in flight when a new change comes in,
 * waits for it to finish and then fires again with the latest value.
 * Surfaces the thrown error message so the UI can display it.
 */
export function useAutosave<T>(
  value: T,
  save: (v: T) => Promise<void>,
  delayMs = 500
): AutosaveResult {
  const [status, setStatusState] = useState<AutosaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const statusRef = useRef<AutosaveStatus>("idle");
  const latest = useRef(value);
  const firstRun = useRef(true);
  const inFlight = useRef(false);

  const setStatus = useCallback((next: AutosaveStatus) => {
    if (statusRef.current === next) return;
    statusRef.current = next;
    setStatusState(next);
  }, []);

  useEffect(() => {
    latest.current = value;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("pending");
    const t = setTimeout(async () => {
      if (inFlight.current) return; // another run will pick up latest.current
      inFlight.current = true;
      setStatus("saving");
      const snapshot = latest.current;
      try {
        await save(snapshot);
        if (latest.current !== snapshot) await save(latest.current);
        setError(null);
        setStatus("saved");
      } catch (e) {
        setError(e instanceof Error ? e.message : "save failed");
        setStatus("error");
      } finally {
        inFlight.current = false;
      }
    }, delayMs);
    return () => clearTimeout(t);
  }, [value, save, delayMs, setStatus]);

  return { status, error };
}
