import { useState } from 'react';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { ProfileBadge } from './components/ProfileBadge';
import { BottomNav, type TabKey } from "./components/BottomNav";

import { useAuth } from './hooks/useAuth';
import { useActiveTabUrl } from './hooks/useActiveTabUrl';
import { useDarkMode } from './hooks/useDarkMode';

import { LoggedOutView } from './views/LoggedOutView';
import { BlockView } from './views/BlockView';
import { FocusView } from './views/FocusView';
import { StatsView } from './views/StatsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const { isLogged, athlete, loading, login, logout } = useAuth();
  const { currentUrl } = useActiveTabUrl();
  const { toggleDarkMode } = useDarkMode();

  const [activeTab, setActiveTab] = useState<TabKey>('block');

  if (loading) {
    return (
      <div className="popup-container loading-state">
        <div className="spinner" />
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <Header isLogged={isLogged} onLogout={logout} onToggleDark={toggleDarkMode} />

      <main className="popup-content">
        {!isLogged ? (
            <>
            <Banner isLogged={isLogged} />
            <ProfileBadge isLogged={isLogged} avatarSrc={undefined} />
            <LoggedOutView onLogin={login} />
            </>
        ) : (
            <>
            {activeTab === "block" && (
                <div className="info-section">
                    <h1 className="app-title">Witaj, {athlete?.firstname}!</h1>

                    <div className="url-display">
                    <span className="url-label">Obecna strona:</span>
                    <span className="url-value">{currentUrl}</span>
                    </div>
                </div>
            )}

            <div className="action-section">
                {activeTab === "block" && (
                <div className="tab-panel tab-panel-block">
                    <BlockView />
                </div>
                )}

                {activeTab === "focus" && (
                <div className="tab-panel tab-panel-focus">
                    <FocusView isActive />
                </div>
                )}

                {activeTab === "stats" && (
                <div className="tab-panel tab-panel-stats">
                    <StatsView />
                </div>
                )}

                {activeTab === "settings" && (
                <div className="tab-panel tab-panel-settings">
                    <SettingsView />
                </div>
                )}
            </div>
            </>
        )}
        </main>


      {isLogged ? (
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      ) : (
        <footer className="popup-footer">
          <span className="version-text">FitLock v1.0.0</span>
        </footer>
      )}
    </div>
  );
}
