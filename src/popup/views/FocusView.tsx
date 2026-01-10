import { useFocusTimer } from "../hooks/useFocusTimer";

type Props = {
  remainingKmText?: string;
  isActive: boolean;
};

export function FocusView({ isActive }: Props) {
  const {
    mode,
    running,
    finished,
    timeLabel,
    progress,
    start,
    pause,
    reset,
    confirmBreak,
    confirmNextFocus,
  } = useFocusTimer(isActive);

  const title = mode === "focus" ? "Tryb Skupienia" : "Przerwa";
  const subtitle =
  mode === "focus"
    ? "Skupienie — 45 minut pracy"
    : "Przerwa regeneracyjna — 15 minut";

  return (
    <>
      <div className="focus-banner">
        <span className="focus-banner-label">Tryb Produktywności</span>
      </div>

      <div className="focus-wrap">
        <div className="focus-card">
          <div className="focus-icon">
            <span className="focus-icon-glyph">⏱</span>
          </div>

          <h1 className="focus-title">{title}</h1>
          <p className="focus-subtitle">{subtitle}</p>

          <div className="focus-timer">
            <span className="focus-time">{timeLabel}</span>

            <div className="focus-progress" aria-hidden="true">
              <div
                className="focus-progress-fill"
                style={{ transform: `scaleX(${progress})` }}
              />
            </div>
          </div>

          {/* Stan po zakończeniu – wymagamy potwierdzenia */}
          {finished ? (
            <div className="focus-finished">
              {mode === "focus" ? (
                <>
                  <p className="focus-finished-text">
                    Sesja zakończona. Chcesz włączyć przerwę?
                  </p>
                  <button className="btn-primary" onClick={confirmBreak} type="button">
                    Włącz przerwę
                  </button>
                  <button className="btn-secondary-text" onClick={reset} type="button">
                    Reset
                  </button>
                </>
              ) : (
                <>
                  <p className="focus-finished-text">
                    Przerwa zakończona. Wracamy do skupienia?
                  </p>
                  <button className="btn-primary" onClick={confirmNextFocus} type="button">
                    Włącz skupienie
                  </button>
                  <button className="btn-secondary-text" onClick={reset} type="button">
                    Reset
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="focus-actions">
              <button
                className="btn-primary"
                onClick={running ? pause : start}
                type="button"
              >
                {running ? "Pauza" : "Start"}
              </button>

              <button className="btn-secondary-text" onClick={reset} type="button">
                Reset
              </button>
            </div>
          )}
        </div>

    
      </div>
    </>
  );
}
