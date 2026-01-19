import { fetchActivities } from './activityService';
import './authService';
import { BLOCKED_SITES_KEY, normalizeStoredDomain } from "../shared/blockedSites";

const ALARM_NAME = 'refresh_strava';
const RULE_ID_BASE = 1000;

// ucieczka znaków specjalnych regex
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//zamienia domenę na regex do użycia w dnr
function domainToRegex(domain: string) {
  const d = escapeRegex(domain);
  return `^https?://([^/]*\\.)?${d}(/|$)`;
}

// pobiera i normalizuje listę domen zablokowanych ze storage
async function getBlockedDomainsFromStorage(): Promise<string[]> {
  try {
    const result = await chrome.storage.local.get([BLOCKED_SITES_KEY]);
    const list = Array.isArray(result?.[BLOCKED_SITES_KEY]) ? result[BLOCKED_SITES_KEY] : [];
    return Array.from(new Set(list.map((x: any) => normalizeStoredDomain(String(x))).filter(Boolean))).sort();
  } catch {
    return [];
  }
}

// pobiera liste domen i ustawia dynamicznie reguly redirectu na blocked.html. Wywolywana po kazdej instalacji/starcie przegladarki/po kazdej zmianie listy blocked_sites
async function syncDnrRulesFromStorage() {
  const domains = await getBlockedDomainsFromStorage();

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  const addRules: chrome.declarativeNetRequest.Rule[] = domains.map((domain, idx) => ({
    id: RULE_ID_BASE + idx,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" },
    },
    condition: {
      regexFilter: domainToRegex(domain),
      resourceTypes: ["main_frame"],
    },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules,
  });
}

chrome.runtime.onInstalled.addListener(() => {
    console.log('FitLock zainstalowany/zaktualizowany.');

    //ustawiamy alarm co 20 min
    chrome.alarms.create(ALARM_NAME, {
        periodInMinutes: 20
    });

    void syncDnrRulesFromStorage();
    fetchActivities();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        console.log('Timer: pobieranie nowych aktywnosci');
        fetchActivities();
    }
});

chrome.runtime.onStartup.addListener(() => {
    void syncDnrRulesFromStorage();
    fetchActivities();
})

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (!changes?.[BLOCKED_SITES_KEY]) return;
  void syncDnrRulesFromStorage();
});
