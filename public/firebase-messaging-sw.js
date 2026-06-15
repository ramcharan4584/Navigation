importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyD_7Cp155ILuZlzdVRk4-pdj9RGlztmkhM",
  authDomain: "student-portal-1baed.firebaseapp.com",
  projectId: "student-portal-1baed",
  storageBucket: "student-portal-1baed.firebasestorage.app",
  messagingSenderId: "1017420453175",
  appId: "1:1017420453175:web:5c9c44f5a68a3e4d5476b2"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log("Background message received:", payload);

  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "UniEats Order Update";

  const options = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "Your order has been delivered.",
    icon: "/images/logo.png",
    badge: "/images/logo.png"
  };

  return self.registration.showNotification(title, options);
});