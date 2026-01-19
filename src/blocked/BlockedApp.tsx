import React, { useEffect, useState } from "react";
import type { GoalProgress } from "../shared/types";

const GOAL_PROGRESS_KEY = "goal_progress";

function formatProgress(p: GoalProgress) {
  return `${p.percentage}% ${p.currentValue}/${p.targetValue} ${p.unit}`;
}

export function BlockedApp() {
  const [progress, setProgress] = useState<GoalProgress | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await chrome.storage.local.get([GOAL_PROGRESS_KEY]);
      setProgress((data?.[GOAL_PROGRESS_KEY] as GoalProgress) ?? null);
    };

    load();

    const handler: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, area) => {
      if (area !== "local") return;
      if (!changes?.[GOAL_PROGRESS_KEY]) return;
      setProgress((changes[GOAL_PROGRESS_KEY].newValue as GoalProgress) ?? null);
    };

    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h1 style={{ margin: "0 0 12px" }}>FITLOCK</h1>

        <div style={{ fontSize: 18, opacity: progress ? 1 : 0.7 }}>
          {progress ? formatProgress(progress) : "Ładuję postęp..."}
        </div>

        <div style={{ opacity: 0.7, marginTop: 10 }}>
          Zrealizuj cel, aby odblokować strony.
        </div>
      </div>
    </div>
  );
}
