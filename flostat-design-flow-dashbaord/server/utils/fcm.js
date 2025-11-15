// fcm.js
// const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json"); // path to your Firebase service account key
import admin from "firebase-admin"
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

// Initialize the Firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  
});
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
    data:stringifyDataValues(data), // optional key-value data
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Successfully sent message:", response);
  } catch (error) {
    console.error("❌ Error sending message:", error);
  }
}


