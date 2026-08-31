import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Rappel quotidien local du défi du jour (aucun serveur). Tout est « best-effort » :
 * en cas de permission refusée ou d'API indisponible, on renvoie false sans planter.
 */

const DAILY_ID = 'daily-reminder';
const HOUR = 19;

/**
 * Programme (ou reprogramme) le rappel quotidien à 19h. Demande la permission au
 * besoin. Renvoie true si le rappel est bien planifié.
 */
export async function scheduleDailyReminder(title: string, body: string): Promise<boolean> {
  try {
    let granted = (await Notifications.getPermissionsAsync()).granted;
    if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily', {
        name: 'Défi du jour',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => undefined);
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: HOUR,
        minute: 0,
        channelId: 'daily',
      },
    });
    return true;
  } catch {
    return false;
  }
}

/** Annule le rappel quotidien. */
export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_ID);
  } catch {
    // ignore
  }
}
