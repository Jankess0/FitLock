import { STRAVA_CONFIG } from "../shared/config.ts";
import type { StravaActivity } from "../shared/types.ts";

// TODO odkomentować po testach zeby działało tylko na aktywnościach z bieżącego dnia
// function isTodayLocal(start_date_local: string): boolean {
//   // start_date_local zwykle: "YYYY-MM-DDTHH:mm:ssZ" lub bez Z
//   const datePart = (start_date_local || "").slice(0, 10); // YYYY-MM-DD
//   const today = new Date().toLocaleDateString("en-CA");   // YYYY-MM-DD w lokalnym TZ
//   return datePart === today;
// }


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

    } catch (error){
        console.error("Failed to load data:", error);
    }
};