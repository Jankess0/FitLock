export function LoggedOutView({ onLogin }: { onLogin: () => void }) {
  return (
    <>
      <div className="info-section">
        <h1 className="app-title">FitLock</h1>
        <div className="status-badge status-offline">Niezalogowany</div>
        <p className="status-desc">
          Zsynchronizuj swoje treningi, aby automatycznie odblokować dostęp do aplikacji.
        </p>
      </div>

      <div className="action-section">
        <button className="btn-primary" onClick={onLogin} type="button">
          Zaloguj przez Stravę
        </button>
      </div>
    </>
  );
}
