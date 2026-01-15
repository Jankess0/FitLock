import { useCallback, useEffect, useState } from "react";
import type { UserGoal } from "../../shared/types";

const STORAGE_KEY = "user_goal";

export const DEFAULT_GOAL: UserGoal = {
  metric: "distance",
  targetValue: 5000,
  allowedSports: ["Run"],
};

type UseUserGoalResult = {
  goal: UserGoal;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateGoal: (goal: UserGoal) => Promise<void>;
};

export function useUserGoal(): UseUserGoalResult {
  const [goal, setGoal] = useState<UserGoal>(DEFAULT_GOAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      const stored = data[STORAGE_KEY] as UserGoal | undefined;

      if (!stored) {
        setGoal(DEFAULT_GOAL);
        return;
      }

      // Minimalna “sanity” walidacja, żeby nie wywalić UI na śmieciach
      const safeGoal: UserGoal = {
        metric: stored.metric === "time" ? "time" : "distance",
        targetValue:
          typeof stored.targetValue === "number" && stored.targetValue > 0
            ? stored.targetValue
            : DEFAULT_GOAL.targetValue,
        allowedSports:
          Array.isArray(stored.allowedSports) && stored.allowedSports.length > 0
            ? stored.allowedSports
            : DEFAULT_GOAL.allowedSports,
      };

      setGoal(safeGoal);
    } catch (e) {
      setError("Nie udało się pobrać user_goal ze storage.");
      setGoal(DEFAULT_GOAL);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateGoal = useCallback(async (next: UserGoal) => {
    setError(null);

    // Nadpisujemy storage
    await chrome.storage.local.set({ [STORAGE_KEY]: next });

    // Aktualizujemy lokalny stan od razu
    setGoal(next);
  }, []);

  return { goal, loading, error, refresh, updateGoal };
}
