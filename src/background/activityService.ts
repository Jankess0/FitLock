import { STRAVA_CONFIG } from "../shared/config.ts";

export const fetchActivities = async (): Promise<void> => {
    try{
        const storage = await chrome.storage.local.get('strava_token');
        const token = storage.strava_token;

        if (!token) {
            throw new Error("Token is null");
        }
        //ustawienie początku dnie bierzącego 0:00:00
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const startOfDay = Math.floor(now.getTime() / 1000);

        //pobieramy tylko aktywnosci z bierzącego dnia
        const url = `${STRAVA_CONFIG.ACTIVITIES_URL}?after=${startOfDay}&per_page=30`;
        const response = await fetch(url ,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`API error occurred: ${response.status}`);;
        }

        //parsowanie danych
        const activities = await response.json();
        //console.log(activities);

        //zapis listy aktywnosci do chrome.storage
        await chrome.storage.local.set({
            'today_activities': activities,
            'last_fetch_time': Date.now()
        });


    } catch (error){
        console.error("Failed to load data:", error);
    }
}