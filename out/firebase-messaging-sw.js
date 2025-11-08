importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js",
);
// // Initialize the Firebase app in the service worker by passing the generated config

const firebaseConfig = {
  apiKey: "AIzaSyBrhgJn_7ykwGKFirRKfyf14K5Fff98XzA",
  authDomain: "nyumbani-5a923.firebaseapp.com",
  projectId: "nyumbani-5a923",
  storageBucket: "nyumbani-5a923.firebasestorage.app",
  messagingSenderId: "263172140633",
  appId: "1:263172140633:web:1c941f9ed5426656784b48",
  measurementId: "G-KEXD1025GK",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

self.addEventListener("install", function (event) {
  console.log("Hello world from the Service Worker");
});

// Handle background messages
self.addEventListener("push", function (event) {

  if (!event.data) {
    return;
  }

  try {
    const payload = event.data.json();

    const notificationTitle = payload.notification?.title;

    let clickAction = "https://e-broker-nextjs.vercel.app/en/";

    if (payload?.data?.chat_message_type) {
      clickAction += `user/chat?propertyId=${payload.data?.property_id}&userId=${payload.data?.sender_id}`;
    }

    const notificationOptions = {
      body: payload.notification?.body,
      icon: payload.data?.icon || "/favicon.ico",
      requireInteraction: true,
      data: {
        url: clickAction,
      },
    };

    // Send a message to the clients about the notification
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        let isClientFocused = false;

        for (const client of clients) {
          if (client.focused || client.visibilityState === "visible") {
            isClientFocused = true;
            break;
          }
        }

        if (!isClientFocused) {
          // Only postMessage if none of the clients are focused (i.e., background)
          clients.forEach((client) => {
            client.postMessage({
              type: "NOTIFICATION_RECEIVED",
              payload,
            });
          });
        }
      }),
    );

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(
        notificationTitle,
        notificationOptions,
      ),
    );
  } catch (error) {
    console.error("Error processing push event:", error);
  }
});

// // Handle notification click events
self.addEventListener("notificationclick", function (event) {

  event.notification.close();

  // Check if a window is already open and focus/redirect it, or open a new one
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const targetUrl = event.notification.data.url;
        // If no existing window found, open a new one
        return clients.openWindow(targetUrl);
      })
      .catch((error) => {
        console.error("Error handling notification click:", error);
        // Fallback: just open a new window
        return clients.openWindow(event.notification.data.url);
      }),
  );
});