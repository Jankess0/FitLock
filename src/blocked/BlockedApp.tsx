import React, { useEffect, useState, useMemo } from "react";
import type { GoalProgress, UserGoal } from "../shared/types";
import "../popup/styles/blockedApp.css";

type StravaSport = "Run" | "Ride" | "Swim";

const USER_GOAL_KEY = "user_goal";
const GOAL_PROGRESS_KEY = "goal_progress";

const openSettings = () => chrome.tabs.create({ url: chrome.runtime.getURL("app.html?tab=settings") });
const openStats = () => chrome.tabs.create({ url: chrome.runtime.getURL("app.html?tab=stats") });

const SPORT_MAPPING: Record<StravaSport, string[]> = {
  Ride: ["Ride", "VirtualRide", "GravelRide", "MountainBikeRide", "EBikeRide", "Handcycle", "Velomobile"],
  Run: ["Run", "VirtualRun", "TrailRun"],
  Swim: ["Swim"],
};

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function detectSportFromGoal(goal: UserGoal | null): StravaSport {
  const allowed = goal?.allowedSports ?? [];
  if (!allowed.length) return "Run";

  for (const [sport, list] of Object.entries(SPORT_MAPPING) as [StravaSport, string[]][]) {
    // najpewniej: allowedSports to dokładnie lista z mapowania
    if (arraysEqual(allowed, list)) return sport;

    // fallback: jeśli ktoś zmieni listę ręcznie, sprawdź czy pierwszy element należy do listy
    if (list.includes(allowed[0])) return sport;
  }

  return "Run";
}

function clampPercent(p: number) {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(100, Math.round(p)));
}

function formatValue(progress: GoalProgress) {
  const percent = clampPercent(progress.percentage);

  // distance: m -> km
  if (progress.unit === "m") {
    const curKm = progress.currentValue / 1000;
    const tarKm = progress.targetValue / 1000;

    const valueMain = curKm >= 10 ? curKm.toFixed(0) : curKm.toFixed(1);
    const valueSub = `/ ${tarKm >= 10 ? tarKm.toFixed(0) : tarKm.toFixed(1)} km`;
    return { valueMain, valueSub, percent, label: "Dystans" as const };
  }

  // time: s -> min
  if (progress.unit === "s") {
    const curMin = Math.round(progress.currentValue / 60);
    const tarMin = Math.round(progress.targetValue / 60);
    return { valueMain: String(curMin), valueSub: `/ ${tarMin} min`, percent, label: "Czas" as const };
  }

  return {
    valueMain: String(progress.currentValue),
    valueSub: `/ ${progress.targetValue} ${progress.unit}`,
    percent,
    label: "Postęp" as const,
  };
}

function ChallengeCard(props: {
  icon: string;
  title: string;
  label: string;
  valueMain: string;
  valueSub: string;
  percent: number;
}) {
  const { icon, title, label, valueMain, valueSub, percent } = props;

  return (
    <div className="card">
      <div className="cardHeader">
        <div className="cardLeft">
          <div className="iconPill">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <span className="cardTitle">{title}</span>
        </div>
        <span className="cardLabel">{label}</span>
      </div>

      <div className="cardStats">
        <span className="cardValue">
          {valueMain} <span className="cardValueSub">{valueSub}</span>
        </span>
        <span className="cardPercent">{percent}%</span>
      </div>

      <div className="bar">
        <div className="barFill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function BlockedApp() {
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [progress, setProgress] = useState<GoalProgress | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await chrome.storage.local.get([USER_GOAL_KEY, GOAL_PROGRESS_KEY]);
      setGoal((data?.[USER_GOAL_KEY] as UserGoal) ?? null);
      setProgress((data?.[GOAL_PROGRESS_KEY] as GoalProgress) ?? null);
    };

    load();

    const handler: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, area) => {
      if (area !== "local") return;

      if (changes?.[USER_GOAL_KEY]) {
        setGoal((changes[USER_GOAL_KEY].newValue as UserGoal) ?? null);
      }
      if (changes?.[GOAL_PROGRESS_KEY]) {
        setProgress((changes[GOAL_PROGRESS_KEY].newValue as GoalProgress) ?? null);
      }
    };

    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  const sport = useMemo(() => detectSportFromGoal(goal), [goal]);

  const cardMeta = useMemo(() => {
    if (sport === "Ride") return { icon: "directions_bike", title: "Rower" };
    if (sport === "Swim") return { icon: "pool", title: "Pływanie" };
    return { icon: "directions_run", title: "Bieganie" };
  }, [sport]);

  const formatted = useMemo(() => {
    if (!progress) {
      return { valueMain: "-", valueSub: "", percent: 0, label: goal?.metric === "time" ? "Czas" : "Dystans" };
    }
    const f = formatValue(progress);
    return { ...f, label: goal?.metric === "time" ? "Czas" : "Dystans" };
  }, [progress, goal?.metric]);

  const goTrain = () => {
    chrome.tabs?.create?.({ url: "https://www.strava.com/" });
  };

  return (
    <div className="page">
      <div className="layout">
        {/* LEFT */}
        <section className="left">
          <div className="bgOrbs" aria-hidden="true">
            <div className="orb orb1" />
            <div className="orb orb2" />
          </div>

          <div className="leftInner">
            <div className="brand">
              <div className="brandIcon">
                <img
                  src={chrome.runtime.getURL("logo-128.png")}
                  alt="FitLock"
                  style={{ width: 34, height: 34, objectFit: "contain" }}
                />
              </div>
              <div className="brandText">
                Fit<span className="primary">Lock</span>
              </div>
            </div>

            <h1 className="hero">
              NIE TRAĆ CZASU <br />
              <span className="outline">TUTAJ</span>, <br />
              WYPRACUJ FORMĘ <br />
              <span className="primary">TAM!</span>
            </h1>

            <div className="statusRow">
              <div className="statusLine" />
              <p className="statusText">Blokada aktywna</p>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="right">
          <div className="rightTop">
            <div className="headerRow">
              <div className="headerLeft">
                <p className="kicker">Postęp Dnia</p>
                <h2 className="title">Twoje Wyzwanie</h2>
              </div>
              <div className="headerRight">
                <span className="muted">Dzisiaj</span>
              </div>
            </div>

            <div className="cards">
              <ChallengeCard
                icon={cardMeta.icon}
                title={cardMeta.title}
                label={formatted.label}
                valueMain={formatted.valueMain}
                valueSub={formatted.valueSub}
                percent={formatted.percent}
              />
            </div>
          </div>

          <div className="rightBottom">
            <button className="cta" type="button" onClick={goTrain}>
              <span className="material-symbols-outlined ctaIcon">fitness_center</span>
              IDŹ NA TRENING
            </button>

            {/* <div className="links">
              <a href="#" className="link" onClick={(e) => { e.preventDefault(); openSettings(); }}>
                Ustawienia Celów
              </a>
              <a href="#" className="link" onClick={(e) => { e.preventDefault(); openStats(); }}>
                Moje Statystyki
              </a>
            </div> */}
          </div>
        </section>
      </div>
    </div>
  );
}