import { STRAVA_CONFIG } from "../shared/config.ts";

export const fetchActivities = async (): Promise<void> => {
    try{
        const storage = await chrome.storage.local.get('strava_token');
        const token = storage.strava_token;

        if (!token) {
            throw new Error("Token is null");
        }
        //TODO fetch only acvitities with current date
        const response = await fetch(STRAVA_CONFIG.ACTIVITIES_URL + '?per_page=5',{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("API error occurred");
        }

        //parsowanie danych
        const data = await response.json();
        console.log(data);

    } catch (error){
        console.error("Failed to load data:", error);
    }
}