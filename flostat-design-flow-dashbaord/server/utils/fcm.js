import admin from "firebase-admin"

let firebaseInitialized = false;
let messaging;

// Try to initialize Firebase Admin
try {
  // Use require for JSON files in CommonJS style within ES modules
  const serviceAccount = require("./serviceAccountKey.json");
  
  // Initialize the Firebase app
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  messaging = admin.messaging();
  firebaseInitialized = true;
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.log("⚠️ Firebase Admin initialization skipped:", error.message);
  console.log("💡 FCM notifications will be disabled");
  
  // Mock messaging function for environments without Firebase config
  messaging = {
    send: async (message) => {
      console.log("📢 Mock FCM Notification:");
      console.log("  Title:", message.notification?.title);
      console.log("  Body:", message.notification?.body);
      console.log("  Data:", message.data);
      console.log("  Token:", message.token);
      return "mock-response-id";
    }
  };
}

const stringifyDataValues = (data) => {
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] =
      typeof value === "object" ? JSON.stringify(value) : String(value);
  }
  return result;
};

// Function to send FCM notification
export async function sendNotification(token, title, body, data = {}) {
  const message = {
    notification: {
      title,
      body,
    },
    data: stringifyDataValues(data),
    token,
  };

  try {
    const response = await messaging.send(message);
    if (firebaseInitialized) {
      console.log("✅ Successfully sent message:", response);
    }
    return response;
  } catch (error) {
    console.error("❌ Error sending message:", error);
    throw error;
  }
}