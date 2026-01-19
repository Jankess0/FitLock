import { STRAVA_CONFIG } from "../shared/config.ts";
import type { StravaActivity, UserGoal } from "../shared/types.ts";
import { calculateProgress } from "../shared/utils.ts";
import { BLOCKED_SITES_KEY } from "../shared/blockedSites";

const USER_GOAL_KEY = "user_goal";
const GOAL_PROGRESS_KEY = "goal_progress";

const FALLBACK_GOAL: UserGoal = {
  metric: "distance",
  targetValue: 5000,
  allowedSports: []
};

// pobiera cel użytkownika ze storage lub inicjalizuje go domyślną wartością
async function getOrInitGoal(): Promise<UserGoal> {
  const data = await chrome.storage.local.get([USER_GOAL_KEY]);
  const stored = data?.[USER_GOAL_KEY] as UserGoal | undefined;

  if (stored && stored.metric && stored.targetValue) return stored;

  // ustawiamy fallback, bo użytkownik nie podał celu
  await chrome.storage.local.set({ [USER_GOAL_KEY]: FALLBACK_GOAL });
  return FALLBACK_GOAL;
}

// TODO odkomentować po testach zeby działało tylko na aktywnościach z bieżącego dnia
// function isTodayLocal(start_date_local: string): boolean {
//   // start_date_local zwykle: "YYYY-MM-DDTHH:mm:ssZ" lub bez Z
//   const datePart = (start_date_local || "").slice(0, 10); // YYYY-MM-DD
//   const today = new Date().toLocaleDateString("en-CA");   // YYYY-MM-DD w lokalnym TZ
//   return datePart === today;
// }

function activityType(activity: StravaActivity): string {
  return (activity.sport_type || activity.type || "").trim();
}

export const fetchActivities = async (): Promise<void> => {
    try{
        const storage = await chrome.storage.local.get('strava_token');
        const token = storage.strava_token;

        if (!token) {
            throw new Error("Token is null");
        }
        //TODO odkomentowac po testach

        //ustawienie początku dnie bierzącego 0:00:00
        // const now = new Date();
        // now.setHours(0, 0, 0, 0);
        // const startOfDay = Math.floor(now.getTime() / 1000);

        //pobieramy tylko aktywnosci z bierzącego dnia
        //TODO odkomentowac po testach

        // const url = `${STRAVA_CONFIG.ACTIVITIES_URL}?after=${startOfDay}&per_page=30`;
        const url = `${STRAVA_CONFIG.ACTIVITIES_URL}?per_page=5`;
        const response = await fetch(url ,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });


        if (!response.ok) {
            throw new Error(`API error occurred: ${response.status}`);
        }

        //parsowanie danych
        const rawActivities = await response.json();
        //console.log(rawActivities);

        const activities: StravaActivity[] = rawActivities.map((item: any) => ({
            id: item.id,
            start_date_local: item.start_date_local,
            distance: item.distance,
            moving_time: item.moving_time,
            sport_type: item.sport_type,
            type: item.type
        }));

        //TODO odkomentowac po testach
        //const todayActivities = activities.filter((a) => isTodayLocal(a.start_date_local));

        //TODO a to usunac
        const todayActivities = activities; //tymczasowo bierzemy wszystkie do testów

        //zapis listy aktywnosci do chrome.storage
        await chrome.storage.local.set({
            'today_activities': todayActivities,
            'last_fetch_time': Date.now()
        });

        const goal = await getOrInitGoal();

        //TEST do sprawdzenia czy odblokowuje
        // const progress = {
        //     currentValue: goal.targetValue,
        //     targetValue: goal.targetValue,
        //     percentage: 100,
        //     isMet: true,
        //     unit: goal.metric === "distance" ? "m" : "s"
        // };
        const allowed = goal.allowedSports || [];
        const filteredForGoal =
            allowed.length === 0
                ? todayActivities
                : todayActivities.filter((a) => allowed.includes(activityType(a)));

        const progress = calculateProgress(filteredForGoal, goal);
        await chrome.storage.local.set({
            [GOAL_PROGRESS_KEY]: progress,
        });
        if (progress.isMet) {
            await chrome.storage.local.set({ [BLOCKED_SITES_KEY]: [] });
        }
        
    } catch (error){
        console.error("Failed to load data:", error);
    }
};