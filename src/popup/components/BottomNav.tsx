export type TabKey = 'block' | 'focus' | 'stats' | 'settings';

export function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'block' ? 'active' : ''}`}
        onClick={() => onChange('block')}
        type="button"
      >
        <i className="fa-solid fa-shield nav-icon"></i>
        <span className="nav-label">Blokady</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'focus' ? 'active' : ''}`}
        onClick={() => onChange('focus')}
        type="button"
      >
        <i className="fa-solid fa-bolt nav-icon"></i>
        <span className="nav-label">Skupienie</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => onChange('stats')}
        type="button"
      >
        <i className="fa-solid fa-chart-column nav-icon"></i>
        <span className="nav-label">Statystyki</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onChange('settings')}
        type="button"
      >
        <i className="fa-solid fa-gear nav-icon"></i>
        <span className="nav-label">Ustawienia</span>
      </button>
    </nav>
  );
}