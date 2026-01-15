import type { StravaActivity, UserGoal, GoalProgress} from "../shared/types.ts";
import { calculateProgress} from "../shared/utils.ts";

//poczatkowe ustawienia celu
//TODO usunac po obsluzeniu zapisu z frontu
const FALLBACK_GOAL: UserGoal= {
    metric: 'distance',
    targetValue: 5000,
    allowedSports: []
};

//TODO usunac po podlaczniu do chrome.storage z frontu

// const mockActivities = [
//     { id: 1, start_date_local: "2026-01-15T10:00:00", distance: 3000, moving_time: 900, sport_type: "Run" }, // Dziś, 3km
//     { id: 2, start_date_local: "2026-01-15T13:00:00", distance: 2000, moving_time: 600, sport_type: "Run" }, // Dziś, 2km
//     { id: 3, start_date_local: "2026-01-15T10:00:00", distance: 5000, moving_time: 1500, sport_type: "Run" } // Wczoraj (powinno zignorować)
// ];
//TODO usunac po podlaczeniu do chrome.storage obslugi z frontu
//do testow normalnie bedzie w storage pod kluczem 'blocked_sites'
const DEFAULT_BLOCKED_SITES = ['youtube.com'];

const isCurrentSiteBlocked = (blockedSites: string[]): boolean => {
    const currentHostname = window.location.hostname; //np youtube.com
    //sprawdzamy czy jest na lisce blokowanych
    return blockedSites.some(site => currentHostname.includes(site));
};

const showBlocker = (progress: GoalProgress) => {
    //jesli blokada istnieje nie dodejmu jej drugi raz
    if (document.getElementById('fitlock-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'fitlock-overlay';

    Object.assign(overlay.style, {
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: '9999999',
        backgroundColor: 'white',
    });

    overlay.innerHTML = `
    <div style="text-align: center;">
        <h1>FITLOCK</h1>
        TEST ${progress.percentage}% ${progress.currentValue}/${progress.targetValue} ${progress.unit}
    </div>`;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden'; //zablokowanie scrolowania pod spodem
};

const hideBlocker = () => {
    const overlay = document.getElementById('fitlock-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
        console.log('Cel osiągniety');
    }
};

const checkStatus = async () => {
    try {
        //pobieramy wszystkie dane: aktywnosci, cel, liste stron
        const data = await chrome.storage.local.get([
            'today_activities',
            'user_goal',
            'blocked_sites'
        ]);

        const blockedSites = (data.blocked_sites || DEFAULT_BLOCKED_SITES) as string[];

        if (!isCurrentSiteBlocked(blockedSites)) {
            console.log('strona nie jest na czarnej liscie');
            return;
        }

        console.log('STORNA NA CZARNEJ LISCIE');

        const activities = (data.today_activities  || []) as StravaActivity[];
        console.log(activities);
        //const activities = mockActivities as StravaActivity[];
        const goal = (data.user_goal as UserGoal) || FALLBACK_GOAL;

        const progress = calculateProgress(activities, goal);

        if (!progress.isMet){
            showBlocker(progress);
        } else {
            hideBlocker();
            const currentData = await chrome.storage.local.get('goal_achieved_number') as { goal_achieved_number?: number };

            const currentCount = (currentData.goal_achieved_number || 0) + 1;

            await chrome.storage.local.set({
                'goal_achieved_number': currentCount
            });
        }
    } catch (e) {
        console.error("Błąd w sprawdzaniu statusu blokady", e);
    }
};

checkStatus();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        //reagujemy na zmian eaktywnoci celu lub listy stron
        if (changes.today_activities || changes.user_goal || changes.blocked_sites) {
            checkStatus();
        }
    }
});
