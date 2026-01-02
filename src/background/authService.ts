import { STRAVA_CONFIG } from '../shared/config.ts';

export const loginWithStrava = async (): Promise<boolean> => {
    const authURL = `${STRAVA_CONFIG.AUTH_URL}?client_id=${STRAVA_CONFIG.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(STRAVA_CONFIG.REDIRECT_URL)}&scope=${STRAVA_CONFIG.SCOPES}&approval_prompt=auto`;

    try {
        const redirectURL = await chrome.identity.launchWebAuthFlow({
            url: authURL,
            interactive: true
        });

        if (!redirectURL) throw new Error('Canceled by user');

        const url = new URL(redirectURL);
        const code = url.searchParams.get('code');

        const response = await fetch(STRAVA_CONFIG.TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: STRAVA_CONFIG.CLIENT_ID,
                client_secret: STRAVA_CONFIG.CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
            })
        });

        const data = await response.json();

        await chrome.storage.local.set({
            'strava_token': data.access_token,
            'strava_refresh_token': data.access_token,
            'strava_expires_at': data.expires_at,
            'strava_athlete': data.athlete
        });
        return true;
    } catch (error) {
        console.error("Auth error", error);
        return false;
    }
};