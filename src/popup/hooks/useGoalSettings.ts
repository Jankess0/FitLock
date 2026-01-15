import { useEffect, useMemo, useState } from "react";
import type { UserGoal } from "../../shared/types";
import { useUserGoal } from "./useUserGoal";

export type GoalMetric = "distance" | "time";
export type StravaSport = "Run" | "Ride" | "Swim";

type HookState = {
  loading: boolean;
  metric: GoalMetric;
  rawValue: string; // km lub min (UI)
  sport: StravaSport;

  unitLabel: "km" | "min";
  computedTarget: number; // metry (distance) albo sekundy (time)

  savedMsg: string | null;
  errorMsg: string | null;

  setMetric: (m: GoalMetric) => void;
  setRawValue: (v: string) => void;
  setSport: (s: StravaSport) => void;

  save: () => Promise<void>;
  resetToStored: () => Promise<void>;
};

export function useGoalSettings(): HookState {
  const { goal, loading, error, updateGoal, refresh } = useUserGoal();

  // UI state (form)
  const [metric, setMetric] = useState<GoalMetric>("distance");
  const [rawValue, setRawValue] = useState<string>("5");
  const [sport, setSport] = useState<StravaSport>("Run");

  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hydrate UI state z goal (z storage)
  useEffect(() => {
    setMetric(goal.metric);

    // odwracamy przeliczenie na UI:
    if (goal.metric === "distance") {
      setRawValue(String(Math.round(goal.targetValue / 1000)));
    } else {
      setRawValue(String(Math.round(goal.targetValue / 60)));
    }

    const first = (goal.allowedSports?.[0] as StravaSport | undefined) ?? "Run";
    setSport(first);
  }, [goal.metric, goal.targetValue, goal.allowedSports]);

  // jeśli useUserGoal zgłosi błąd, pokaż go też w tym hooku
  useEffect(() => {
    if (error) setErrorMsg(error);
  }, [error]);

  const unitLabel: "km" | "min" = metric === "distance" ? "km" : "min";

  const computedTarget = useMemo(() => {
    const n = Number(rawValue);
    if (!Number.isFinite(n) || n <= 0) return 0;

    // Logika przeliczania:
    // distance: km -> metry
    // time: min -> sekundy
    return metric === "distance" ? Math.round(n * 1000) : Math.round(n * 60);
  }, [metric, rawValue]);

  const save = async () => {
    setErrorMsg(null);
    setSavedMsg(null);

    if (computedTarget <= 0) {
      setErrorMsg("Podaj poprawną wartość celu.");
      return;
    }

    const next: UserGoal = {
      metric,
      targetValue: computedTarget,
      allowedSports: [sport], // single-choice
    };

    try {
      await updateGoal(next);
      setSavedMsg("Zapisano ✅");
      window.setTimeout(() => setSavedMsg(null), 1500);
    } catch {
      setErrorMsg("Nie udało się zapisać ustawień celu.");
    }
  };

  const resetToStored = async () => {
    setSavedMsg(null);
    setErrorMsg(null);
    await refresh();
  };

  return {
    loading,
    metric,
    rawValue,
    sport,
    unitLabel,
    computedTarget,
    savedMsg,
    errorMsg,
    setMetric,
    setRawValue,
    setSport,
    save,
    resetToStored,
  };
}
