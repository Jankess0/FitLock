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
  const { [USER_GOAL_KEY]: goalRaw } = await chrome.storage.local.get(USER_GOAL_KEY);

  if (goalRaw) return goalRaw as UserGoal;

  // ustawiamy fallback, bo użytkownik nie podał celu
  await chrome.storage.local.set({ [USER_GOAL_KEY]: FALLBACK_GOAL });
  return FALLBACK_GOAL;
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

        //zapis listy aktywnosci do chrome.storage
        await chrome.storage.local.set({
            'today_activities': activities,
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
        const progress = calculateProgress(activities, goal);
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