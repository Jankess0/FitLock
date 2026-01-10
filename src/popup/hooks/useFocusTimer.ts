import { useEffect, useMemo, useRef, useState } from "react";

type FocusMode = "focus" | "break";

const FOCUS_TOTAL = 45 * 60;   
const BREAK_TOTAL = 15 * 60;   

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function useFocusTimer(isEnabled: boolean) {
  const [mode, setMode] = useState<FocusMode>("focus");
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const intervalRef = useRef<number | null>(null);

  const totalSeconds = mode === "focus" ? FOCUS_TOTAL : BREAK_TOTAL;

  const timeLabel = useMemo(() => {
    const mm = Math.floor(elapsedSeconds / 60);
    const ss = elapsedSeconds % 60;
    return `${pad(mm)}:${pad(ss)}`;
  }, [elapsedSeconds]);

  const progress = useMemo(() => {
    return Math.min(1, elapsedSeconds / totalSeconds);
  }, [elapsedSeconds, totalSeconds]);

  useEffect(() => {
    if (!isEnabled) {
      setRunning(false);
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled || !running) return;

    intervalRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev + 1 >= totalSeconds) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;

          setRunning(false);
          setFinished(true);

          return totalSeconds;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running, isEnabled, totalSeconds]);


  const start = () => {
    if (finished) return;
    setRunning(true);
  };

  const pause = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setFinished(false);
    setMode("focus");
    setElapsedSeconds(0);
  };

  const confirmBreak = () => {
    setMode("break");
    setElapsedSeconds(0);
    setFinished(false);
    setRunning(true);
  };

  const confirmNextFocus = () => {
    setMode("focus");
    setElapsedSeconds(0);
    setFinished(false);
    setRunning(true);
  };

  return {
    mode,             
    running,
    finished,
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
