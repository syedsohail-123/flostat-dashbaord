import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";

// Firebase configuration from Vite env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Messaging
const messaging = getMessaging(app);

// Get FCM token
export const getFcmToken = async (): Promise<string | null> => {
  try {

    const permission = await Notification.requestPermission();
    console.log("get  fcm token")
    console.log("vapid key: ",import.meta.env.VITE_APP_VAPID_KEY);
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js"),
      });
      console.log("FCM Token:", token);
      return token || null;
    } else {
      console.warn("Notification permission not granted");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving FCM token:", error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = (): Promise<MessagePayload> =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Message received in foreground:", payload);
    new Notification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon,
  });
      resolve(payload);
    });
  });

export { auth, googleProvider, app, messaging };
