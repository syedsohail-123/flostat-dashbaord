/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB4gx7L0nDddqn89wgQVmPt4RWF5SQBneg",
  authDomain: "flostat-dashboard-app.firebaseapp.com",
  projectId: "flostat-dashboard-app",
  storageBucket: "flostat-dashboard-app.firebasestorage.app",
  messagingSenderId: "399503430564",
  appId: "1:399503430564:web:b6ea400e14d760a7e8e731",
  measurementId: "G-MQJR9P0LEM"
});

const messaging = firebase.messaging();

// This triggers when your app is closed or backgrounded
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Received background message: ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png", // optional icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
