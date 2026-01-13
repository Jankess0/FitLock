import { fetchActivities } from './activityService';
import './authService';

const ALARM_NAME = 'refresh_strava';

chrome.runtime.onInstalled.addListener(() => {
    console.log('FitLock zainstalowany/zaktualizowany.');

    //ustawiamy alarm co 20 min
    chrome.alarms.create(ALARM_NAME, {
        periodInMinutes: 20
    });

    fetchActivities();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        console.log('Timer: pobieranie nowych aktywnosci');
        fetchActivities();
    }
});

chrome.runtime.onStartup.addListener(() => {
    fetchActivities();
})
