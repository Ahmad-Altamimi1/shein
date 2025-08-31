import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      let token;

      if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token for push notification!');
          return null;
        }

        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo push token:', token);
      } else {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      // Configure notification channel for Android
      if (Constants.platform?.android) {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  static async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: trigger || null,
    });
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Order status notifications
  static async notifyOrderStatusChange(orderId: string, status: string): Promise<void> {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being processed.',
      processing: 'Your order is being prepared for shipment.',
      shipped: 'Great news! Your order has been shipped and is on its way.',
      delivered: 'Your order has been delivered successfully!',
      cancelled: 'Your order has been cancelled.',
    };

    const message = statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.';

    await this.scheduleLocalNotification(
      `Order Update - #${orderId}`,
      message,
      { orderId, status, type: 'order_update' }
    );
  }

  // Promotional notifications
  static async notifyPromotion(title: string, message: string, data?: any): Promise<void> {
    await this.scheduleLocalNotification(
      title,
      message,
      { ...data, type: 'promotion' }
    );
  }

  // Recommendation notifications
  static async notifyRecommendation(productName: string, productId: string): Promise<void> {
    await this.scheduleLocalNotification(
      'New Recommendation',
      `Check out ${productName} - we think you'll love it!`,
      { productId, type: 'recommendation' }
    );
  }
}

export default app;