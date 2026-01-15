import { useGoalSettings } from "../hooks/useGoalSettings";

export function SettingsView() {
  const {
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
  } = useGoalSettings();

  if (loading) {
    return (
      <div className="tab-view">
        <div className="spinner" />
        <p>Ładowanie ustawień...</p>
      </div>
    );
  }

  return (
    <div className="tab-view">
      <div className="settings-card">
        {/* Typ celu */}
        <div className="settings-row">
          <span className="settings-label">Typ celu</span>
          <div className="segmented">
            <button
              className={`segmented-btn ${metric === "distance" ? "active" : ""}`}
              onClick={() => setMetric("distance")}
              type="button"
            >
              Dystans
            </button>
            <button
              className={`segmented-btn ${metric === "time" ? "active" : ""}`}
              onClick={() => setMetric("time")}
              type="button"
            >
              Czas
            </button>
          </div>
        </div>

        {/* Wartość */}
        <div className="settings-row">
          <span className="settings-label">Wartość</span>
          <div className="input-with-unit">
            <input
              value={rawValue}
              onChange={(e) => setRawValue(e.target.value)}
              inputMode="numeric"
              className="settings-input"
              placeholder={metric === "distance" ? "np. 5" : "np. 30"}
            />
            <span className="unit-pill">{unitLabel}</span>
          </div>

          <div className="settings-hint">
            Zapiszemy: <b>{computedTarget}</b> {metric === "distance" ? "m" : "s"}
          </div>
        </div>

        {/* Sport */}
        <div className="settings-row">
          <span className="settings-label">Sport</span>
          <div className="sport-buttons">
            <button
              className={`sport-btn ${sport === "Run" ? "active" : ""}`}
              onClick={() => setSport("Run")}
              type="button"
            >
              Bieganie
            </button>
            <button
              className={`sport-btn ${sport === "Ride" ? "active" : ""}`}
              onClick={() => setSport("Ride")}
              type="button"
            >
              Rower
            </button>
            <button
              className={`sport-btn ${sport === "Swim" ? "active" : ""}`}
              onClick={() => setSport("Swim")}
              type="button"
            >
              Pływanie
            </button>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={save}
          type="button"
          disabled={computedTarget <= 0}
        >
          Zapisz cel
        </button>

        {errorMsg && <div className="settings-error">{errorMsg}</div>}
        {savedMsg && <div className="settings-saved">{savedMsg}</div>}
      </div>
    </div>
  );
}
