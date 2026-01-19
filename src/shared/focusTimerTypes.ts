export type FocusMode = "focus" | "break";

export type FocusTimerState = {
  mode: FocusMode;
  running: boolean;
  finished: boolean;
  startAtMs: number | null;
  accumulatedSeconds: number;
  updatedAtMs: number;
};
