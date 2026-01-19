import { useEffect, useMemo, useRef, useState } from "react";

type FocusMode = "focus" | "break";

const FOCUS_TOTAL = 45 * 60;
const BREAK_TOTAL = 15 * 60;

const STORAGE_KEY = "focus_timer";

type FocusTimerState = {
  mode: FocusMode;
  running: boolean;
  finished: boolean;
  startAtMs: number | null;
  accumulatedSeconds: number;
  updatedAtMs: number;
};

const DEFAULT_STATE: FocusTimerState = {
  mode: "focus",
  running: false,
  finished: false,
  startAtMs: null,
  accumulatedSeconds: 0,
  updatedAtMs: Date.now(),
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function totalForMode(mode: FocusMode) {
  return mode === "focus" ? FOCUS_TOTAL : BREAK_TOTAL;
}

function computeElapsedSeconds(s: FocusTimerState) {
  const base = s.accumulatedSeconds;
  if (!s.running || !s.startAtMs) return base;
  const delta = Math.floor((Date.now() - s.startAtMs) / 1000);
  return base + Math.max(0, delta);
}

export function useFocusTimer(isEnabled: boolean) {
  const [state, setState] = useState<FocusTimerState>(DEFAULT_STATE);

  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      const stored = data[STORAGE_KEY] as FocusTimerState | undefined;
      setState(stored ?? DEFAULT_STATE);
    })();
  }, []);

  const persist = async (next: FocusTimerState) => {
    await chrome.storage.local.set({ [STORAGE_KEY]: next });
    setState(next);
  };

  const totalSeconds = totalForMode(state.mode);

  const elapsedSeconds = useMemo(() => {
    const e = computeElapsedSeconds(state);
    return Math.min(e, totalSeconds);
  }, [state, totalSeconds]);

  const finished = elapsedSeconds >= totalSeconds;
  const running = state.running && !finished;

  useEffect(() => {
    if (!state.running) return;
    if (!finished) return;

    void persist({
      ...state,
      running: false,
      finished: true,
      startAtMs: null,
      accumulatedSeconds: totalSeconds,
      updatedAtMs: Date.now(),
    });
  }, [finished]);

  useEffect(() => {
    if (!isEnabled || !running) return;

    tickRef.current = window.setInterval(() => {
      setState((prev) => ({ ...prev, updatedAtMs: Date.now() }));
    }, 1000);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [isEnabled, running]);

  useEffect(() => {
    if (!isEnabled) {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, [isEnabled]);

  const timeLabel = useMemo(() => {
    const mm = Math.floor(elapsedSeconds / 60);
    const ss = elapsedSeconds % 60;
    return `${pad(mm)}:${pad(ss)}`;
  }, [elapsedSeconds]);

  const progress = useMemo(() => {
    return Math.min(1, elapsedSeconds / totalSeconds);
  }, [elapsedSeconds, totalSeconds]);


  const start = async () => {
    if (finished) return;

    if (state.running && state.startAtMs) return;

    await persist({
      ...state,
      running: true,
      finished: false,
      startAtMs: Date.now(),
      updatedAtMs: Date.now(),
    });
  };

  const pause = async () => {
    if (!state.running) return;

    const elapsedNow = computeElapsedSeconds(state);

    await persist({
      ...state,
      running: false,
      startAtMs: null,
      accumulatedSeconds: Math.min(elapsedNow, totalSeconds),
      updatedAtMs: Date.now(),
    });
  };

  const reset = async () => {
    await persist({
      ...DEFAULT_STATE,
      mode: "focus",
      updatedAtMs: Date.now(),
    });
  };

  const confirmBreak = async () => {
    await persist({
      ...DEFAULT_STATE,
      mode: "break",
      running: true,
      startAtMs: Date.now(),
      updatedAtMs: Date.now(),
    });
  };

  const confirmNextFocus = async () => {
    await persist({
      ...DEFAULT_STATE,
      mode: "focus",
      running: true,
      startAtMs: Date.now(),
      updatedAtMs: Date.now(),
    });
  };

  return {
    mode: state.mode,
    running,
    finished: finished || state.finished,
    elapsedSeconds,
    totalSeconds,
    timeLabel,
    progress,
    start,
    pause,
    reset,
    confirmBreak,
    confirmNextFocus,
  };
}
