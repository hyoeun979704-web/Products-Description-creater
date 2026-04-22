"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

/**
 * Debounced autosave. Calls `save(value)` `delayMs` after the last change.
 * Skips the initial mount. If a save is in flight when a new change comes in,
 * waits for it to finish and then fires again with the latest value.
 */
export function useAutosave<T>(
  value: T,
  save: (v: T) => Promise<void>,
  delayMs = 500
): AutosaveStatus {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const latest = useRef(value);
  const firstRun = useRef(true);
  const inFlight = useRef(false);

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
        // If more edits arrived while saving, chain another save.
        if (latest.current !== snapshot) {
          await save(latest.current);
        }
        setStatus("saved");
      } catch {
        setStatus("error");
      } finally {
        inFlight.current = false;
      }
    }, delayMs);
    return () => clearTimeout(t);
  }, [value, save, delayMs]);

  return status;
}
