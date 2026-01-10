export type TabKey = 'block' | 'focus' | 'stats';

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
        <span className="nav-icon">🛡️</span>
        <span className="nav-label">Blokady</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'focus' ? 'active' : ''}`}
        onClick={() => onChange('focus')}
        type="button"
      >
        <span className="nav-icon">⚡</span>
        <span className="nav-label">Skupienie</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => onChange('stats')}
        type="button"
      >
        <span className="nav-icon">📊</span>
        <span className="nav-label">Statystyki</span>
      </button>
    </nav>
  );
}