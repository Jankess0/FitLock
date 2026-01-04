import { useState, useEffect } from 'react';
import { loginWithStrava } from '../background/authService';

interface Athlete {
    firstname: string;
    lastname: string;
}

function App() {
    const [isLogged, setIsLogged] = useState<boolean>(false);
    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        interface StravaData {
            strava_token?: string;
            strava_expires_at: number;
            strava_athlete: Athlete;
        }

        const data = (await chrome.storage.local.get(['strava_token', 'strava_expires_at', 'strava_athlete'])) as StravaData;
        const now = Math.floor(Date.now() / 1000);

        if (data.strava_token && data.strava_expires_at > now) {
            setIsLogged(true);
            setAthlete(data.strava_athlete)
        }
        setLoading(false);
    };

    useEffect(() => {
        const initAuth = async () => {
            await checkAuth();
        };

        initAuth();
    }, []);


    const handleLogin = async () => {
        const success = await loginWithStrava();
        if (success) {
            await checkAuth();
        }
    };

    const handleLogout = async () => {
        await chrome.storage.local.clear();
        setIsLogged(false);
        setAthlete(null);
    };

    if (loading) return <div>Ładowanie...</div>;

    return (
        <div>
            {isLogged ? (
                <div>
                    <h1>Witaj, {athlete?.firstname}!</h1>
                    <button onClick={handleLogout} >
                        Wyloguj
                    </button>
                </div>
            ) : (
                <div>
                    <h1>FitLock</h1>
                    <p>Zaloguj się, aby zsynchronizować treningi.</p>
                    <button onClick={handleLogin} >
                        Zaloguj przez Stravę
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;