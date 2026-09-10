import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationsApi } from '../api/notifications';

// Foreground notifications still show a banner/sound — without this handler
// they'd arrive silently while the app is open, which defeats the point of
// a job-approval or application-status alert.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Called once per login/app-open (see AuthContext). Silently no-ops on
// simulators or if the user declines the permission prompt — a missing
// push token just means that device falls back to in-app notifications only,
// which the backend already treats as the source of truth regardless.
export async function registerForPushNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
    await notificationsApi.registerPushToken(expoPushToken);
  } catch (err) {
    // Physical-device-only APIs, missing EAS projectId, permission dialogs
    // dismissed mid-flow — none of these should block login.
    console.warn('Push registration skipped:', err.message);
  }
}
