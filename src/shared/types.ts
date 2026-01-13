//uproszczony model aktywnosci
export interface StravaActivity {
    id: number;
    start_date_local: string;
    distance: number;
    moving_time: number;
    sport_type: string;
    type?: string;
}

//ustawienia celu uzytkownika
export interface UserGoal {
    metric: 'distance' | 'time';
    targetValue: number;
    allowedSports: string[];
}

//zwracane przez funkcje obliczająca
export interface GoalProgress {
    currentValue: number;
    targetValue: number;
    percentage: number;
    isMet: boolean;
    unit: string;
}