import { useMemo, useState } from "react";
import { useBlockedSites } from "../hooks/useBlockedSites";
import "../styles/block.css";

type BlockViewProps = {
  currentDomain?: string; 
};

export function BlockView({ currentDomain = "" }: BlockViewProps) {
  const { blockedSites, addSite, removeSite } = useBlockedSites();
  const [inputUrl, setInputUrl] = useState("");

  const canBlockCurrent = useMemo(() => {
    const d = (currentDomain || "").trim();
    if (!d) return false;
    return !blockedSites.includes(d);
  }, [blockedSites, currentDomain]);

  const handleBlockCurrent = async () => {
    if (!currentDomain) return;
    await addSite(currentDomain);
  };

  const handleAddFromInput = async () => {
    const v = inputUrl.trim();
    if (!v) return;
    await addSite(v);
    setInputUrl("");
  };

  return (
    <div className="tab-view">
      <div className="block-view">
        <div className="block-actions">
          <button
            className="btn-primary btn-block"
            type="button"
            onClick={handleBlockCurrent}
            disabled={!canBlockCurrent}
            title={!currentDomain ? "Nie udało się pobrać domeny aktywnej karty." : undefined}
          >
            Blokuj tę stronę
          </button>

          <div className="block-add-row">
            <input
              className="block-input"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleAddFromInput();
              }}
              placeholder="Wpisz URL lub domenę (np. youtube.com)"
              aria-label="Dodaj stronę do blokowanych"
            />
            <button className="block-add-btn" type="button" onClick={handleAddFromInput} disabled={!inputUrl.trim()}>
              Dodaj
            </button>
          </div>
        </div>

        <div className="block-list">
          {blockedSites.length === 0 ? (
            <p className="block-empty">Brak zablokowanych stron.</p>
          ) : (
            <ul className="block-ul">
              {blockedSites.map((domain) => (
                <li key={domain} className="block-item">
                  <div className="block-domain">
                    <span className="block-domain-text" title={domain}>
                      {domain}
                    </span>
                    {domain === currentDomain && <span className="block-chip">Aktualna</span>}
                  </div>

                  <button
                    className="block-remove-btn"
                    type="button"
                    onClick={() => void removeSite(domain)}
                    aria-label={`Usuń ${domain} z listy blokowanych`}
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
