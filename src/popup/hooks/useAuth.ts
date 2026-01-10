import { useCallback, useEffect, useState } from 'react';
import { loginWithStrava } from '../../background/authService';
import { fetchActivities } from '../../background/activityService';

export interface Athlete {
  firstname: string;
  lastname: string;
  // Uwaga: jeśli masz avatar URL w Stravie, dodaj tu np. profile: string
}

interface StravaData {
  strava_token?: string;
  strava_expires_at: number;
  strava_athlete: Athlete;
}

export function useAuth() {
  const [isLogged, setIsLogged] = useState(false);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const data = (await chrome.storage.local.get([
      'strava_token',
      'strava_expires_at',
      'strava_athlete',
    ])) as Partial<StravaData>;

    const now = Math.floor(Date.now() / 1000);

    if (data.strava_token && (data.strava_expires_at ?? 0) > now) {
      setIsLogged(true);
      setAthlete((data.strava_athlete ?? null) as Athlete | null);

      // Wczytywanie aktywności użytkownika (jeśli chcesz – możesz to przenieść gdzie indziej)
      await fetchActivities();
    } else {
      setIsLogged(false);
      setAthlete(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // Inicjalizacja auth przy starcie popupu
    void checkAuth();
  }, [checkAuth]);

  const login = useCallback(async () => {
    const success = await loginWithStrava();
    if (success) {
      await checkAuth();
    }
  }, [checkAuth]);

  const logout = useCallback(async () => {
    await chrome.storage.local.clear();
    setIsLogged(false);
    setAthlete(null);
  }, []);

  return { isLogged, athlete, loading, login, logout, refreshAuth: checkAuth };
}
