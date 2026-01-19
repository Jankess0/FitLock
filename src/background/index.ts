import { fetchActivities } from './activityService';
import './authService';
import { BLOCKED_SITES_KEY, normalizeStoredDomain } from "../shared/blockedSites";
import { calculateProgress } from "../shared/utils";
import type { StravaActivity, UserGoal, GoalProgress } from "../shared/types";

const ALARM_NAME = 'refresh_strava';
const USER_GOAL_KEY = "user_goal";
const GOAL_PROGRESS_KEY = "goal_progress";
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
// async function getBlockedDomainsFromStorage(): Promise<string[]> {
//   try {
//     const result = await chrome.storage.local.get([BLOCKED_SITES_KEY]);
//     const list = Array.isArray(result?.[BLOCKED_SITES_KEY]) ? result[BLOCKED_SITES_KEY] : [];
//     return Array.from(new Set(list.map((x: any) => normalizeStoredDomain(String(x))).filter(Boolean))).sort();
//   } catch {
//     return [];
//   }
// }

// pobiera liste domen i ustawia dynamicznie reguly redirectu na blocked.html. Wywolywana po kazdej instalacji/starcie przegladarki/po kazdej zmianie listy blocked_sites
async function updateProgressState() {
    try {
        const data = await chrome.storage.local.get(['today_activities', USER_GOAL_KEY]);

        const activities = (data.today_activities || []) as StravaActivity[];
        // Fallback jeśli brak celu (powinien być zainicjalizowany wcześniej, ale dla bezpieczeństwa)
        const goal = (data[USER_GOAL_KEY] || { metric: "distance", targetValue: 5000, allowedSports: [] }) as UserGoal;

        // Obliczamy postęp
        const progress = calculateProgress(activities, goal);

        console.log("🔄 Przeliczono postęp:", progress);

        // Zapisujemy wynik.
        // WAŻNE: To zmieni klucz GOAL_PROGRESS_KEY, co wywoła listener ponownie,
        // dlatego w listenerze musimy obsłużyć blokady (syncDnr).
        await chrome.storage.local.set({
            [GOAL_PROGRESS_KEY]: progress
        });

        // Opcjonalnie: Obsługa licznika sukcesów (żeby nabić tylko raz dziennie)
        if (progress.isMet) {
            // Tu można dodać logikę goal_achieved, o której rozmawialiśmy wcześniej
        }

    } catch (e) {
        console.error("Błąd obliczania postępu:", e);
    }
}

// 2. Zmodyfikowana funkcja: Zarządza regułami blokowania
async function syncDnrRulesFromStorage() {
    try {
        // Pobieramy listę stron ORAZ aktualny postęp
        const data = await chrome.storage.local.get([BLOCKED_SITES_KEY, GOAL_PROGRESS_KEY]);

        const progress = data[GOAL_PROGRESS_KEY] as GoalProgress | undefined;

        // WAŻNA ZMIANA: Jeśli cel jest osiągnięty (isMet), czyścimy reguły blokowania (wolność!)
        // ale NIE kasujemy listy stron z BLOCKED_SITES_KEY.
        if (progress?.isMet) {
            console.log("🎉 Cel osiągnięty! Zdejmuję blokady.");
            const existing = await chrome.declarativeNetRequest.getDynamicRules();
            const removeRuleIds = existing.map((r) => r.id);
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds,
                addRules: [], // Pusta lista reguł = brak blokad
            });
            return;
        }

        // Jeśli cel NIE jest osiągnięty -> blokujemy normalnie
        const rawList = Array.isArray(data?.[BLOCKED_SITES_KEY]) ? data[BLOCKED_SITES_KEY] : [];
        const domains = Array.from(new Set(rawList.map((x: any) => normalizeStoredDomain(String(x))).filter(Boolean))).sort();

        const existing = await chrome.declarativeNetRequest.getDynamicRules();
        const removeRuleIds = existing.map((r) => r.id);

        const addRules: chrome.declarativeNetRequest.Rule[] = domains.map((domain: string, idx: number) => ({
            id: RULE_ID_BASE + idx,
            priority: 1,
            action: {
                type: "redirect",
                redirect: { extensionPath: "/blocked.html" },
            },
            condition: {
                regexFilter: domainToRegex(domain as string),
                resourceTypes: ["main_frame"],
            },
        }));

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds,
            addRules,
        });
        console.log(`🔒 Zaktualizowano blokady: ${addRules.length} reguł.`);

    } catch (e) {
        console.error("Błąd synchronizacji reguł DNR:", e);
    }
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

    // 1. Jeśli zmieniły się aktywności LUB cel -> PRZELICZ POSTĘP
    if (changes['today_activities'] || changes[USER_GOAL_KEY]) {
        void updateProgressState();
    }

    // 2. Jeśli zmieniła się lista stron LUB zmienił się status postępu (np. z false na true) -> AKTUALIZUJ BLOKADY
    if (changes[BLOCKED_SITES_KEY] || changes[GOAL_PROGRESS_KEY]) {
        void syncDnrRulesFromStorage();
    }
});