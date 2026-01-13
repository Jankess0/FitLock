import type {StravaActivity, UserGoal, GoalProgress} from "./types.ts";

export const calculateProgress = (
    activities: StravaActivity[],
    goal: UserGoal
): GoalProgress => {
    //pobieramy dzisiejsza date z przegladarki YYYY-MM-DD
    const now = new Date();
    const todayString = now.toLocaleDateString('en-ca')

    const currentTotal = activities.reduce((sum, activity) => {
        //formatujemy date
        const activityDate = activity.start_date_local.substring(0, 10);

        if (activityDate !== todayString) {
            return sum;
        }

        //filtrowanie czy sport sie liczy jesli allowedSports jest puste liczymy wszystko
        const sport = activity.sport_type || activity.type || '';
        if (goal.allowedSports.length > 0 && !goal.allowedSports.includes(sport)) {
            return sum;
        }

        //dodawanie wartosci
        if (goal.metric === 'distance') {
            return sum + activity.distance;
        } else {
            return sum + activity.moving_time
        }
    }, 0);

    //oblicznie wyniku
    const isMet = currentTotal >=goal.targetValue;
    //obliczmy procent
    let percentage = 0;
    if (goal.targetValue > 0) {
        percentage = Math.round((currentTotal / goal.targetValue) * 100);
    }

    const displayPercentage = Math.min(100, percentage);

    return {
        currentValue: Math.round(currentTotal),
        targetValue: goal.targetValue,
        percentage: displayPercentage,
        isMet: isMet,
        unit: goal.metric === 'distance' ? 'm' : 's',
    };
};