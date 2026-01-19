import { BLOCKED_SITES_KEY, extractDomainFromUrl } from "../shared/blockedSites";

const GOAL_PROGRESS_KEY = "goal_progress";

// bierze url - wyciaga domene - pobiera liste blocked - sprawdza czy domena pasuje
export const isCurrentSiteBlocked = async (): Promise<boolean> => {
  const currentDomain = extractDomainFromUrl(window.location.href);
  if (!currentDomain) return false;

  const data = await chrome.storage.local.get([BLOCKED_SITES_KEY, GOAL_PROGRESS_KEY]);
  const progress = data?.[GOAL_PROGRESS_KEY];

  if (progress?.isMet) {
    return false;
  }

  const blockedSites = Array.isArray(data?.[BLOCKED_SITES_KEY]) ? data[BLOCKED_SITES_KEY] : [];

  // match domeny lub subdomeny
  return blockedSites.some((d) => currentDomain === d || currentDomain.endsWith(`.${d}`));
};


// sprawdza czy strona jest zablokowana jesli nie nic nie robi jesli tak przekirwouje na blocked.html
export const checkStatus = async () => {
  try {
    const blocked = await isCurrentSiteBlocked();
    if (!blocked) return;

    const target = chrome.runtime.getURL("blocked.html");
    if (window.location.href !== target) {
      window.location.href = target;
    }
  } catch (e) {
    console.error("Błąd w sprawdzaniu statusu blokady", e);
  }
};

checkStatus();

// odpala sie jak dodasz/usuniesz domene lub background wyczysci liste blocked_sites
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (!changes[BLOCKED_SITES_KEY] || changes[GOAL_PROGRESS_KEY]) return;
  checkStatus();
});

// przechwytuje zmiany adresu w aplikacjach SPA (bez przeładowania strony) i po każdej takiej zmianie ponownie sprawdza, czy aktualna strona powinna zostać zablokowana.
(function hookSpaNavigation() {
  const fire = () => void checkStatus();

  window.addEventListener("popstate", fire);

  const _pushState = history.pushState;
  history.pushState = function (...args) {
    const ret = _pushState.apply(this, args as any);
    fire();
    return ret;
  };

  const _replaceState = history.replaceState;
  history.replaceState = function (...args) {
    const ret = _replaceState.apply(this, args as any);
    fire();
    return ret;
  };
})();
