type Props = {
  isLogged: boolean;
  onLogout: () => void;
  onToggleDark: () => void;
};

export function Header({ isLogged, onLogout, onToggleDark }: Props) {
  return (
    <header className="popup-header">
      <img src="logo.png" alt="FitLock Logo" className="header-logo-img" />

      <div className="header-actions">
        <button
          className="icon-btn"
          onClick={onToggleDark}
          aria-label="Przełącz tryb ciemny"
          title="Tryb ciemny"
          type="button"
        >
          <span className="icon-moon">🌙</span>
        </button>

        {isLogged && (
          <button className="logout-mini-btn" onClick={onLogout} type="button">
            Wyloguj
          </button>
        )}
      </div>
    </header>
  );
}
