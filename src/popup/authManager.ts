interface StravaAuthData {
    strava_token?: string;
    strava_expires_at?: number;
}

export const isAuthenticated = async (): Promise<boolean> => {
    const data = (await chrome.storage.local.get(['strava_token', 'strava_expires_at'])) as StravaAuthData;

    if (!data.strava_token || !data.strava_expires_at) {
        return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return data.strava_expires_at > (now + 60);
};