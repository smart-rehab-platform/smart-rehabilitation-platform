/*
  Firebase Messaging service worker for Smart Rehabilitation

  IMPORTANT:
  - This file must be served from the web app root at /firebase-messaging-sw.js
  - It requires the Firebase Web config values (public) to initialize.
  - Fill the FIREBASE_CONFIG object below with your project's public values, or create a build step to inject them.

  Where to find values:
  - In Firebase Console > Project settings > General > Your apps (add a Web app if not present)
  - Copy the config object (apiKey, authDomain, projectId, messagingSenderId, appId, etc.)

  VAPID key:
  - Obtain the Web Push certificate (VAPID public key) from Firebase Console > Project Settings > Cloud Messaging > Web configuration
  - Set that VAPID key in the frontend app runtime (VITE_FIREBASE_VAPID_KEY) so the client can call getToken(...)
*/

importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// === EDIT THESE VALUES WITH YOUR PUBLIC FIREBASE WEB CONFIG ===
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDg5iNy1BLTYEnr8czBx6aPQE7vWG0aMSE",
  authDomain: "smart-rehabilitation-platform.firebaseapp.com",
  projectId: "smart-rehabilitation-platform",
  storageBucket: "smart-rehabilitation-platform.firebasestorage.app",
  messagingSenderId: "918900045498",
  appId: "1:918900045498:web:0d7f97202f70d8b31fb483",
  measurementId: "G-DFZE2RY4N1",
};
// =============================================================

if (typeof firebase === 'undefined') {
  // firebase scripts failed to load
} else {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage(function(payload) {
      try {
        const data = payload?.data || {};
        const notification = payload?.notification || {};
        const title = notification.title || data.title || 'Smart Rehabilitation';
        const body = notification.body || data.body || '';
        const tag = data.notificationId || data.notification_id || data.notification || undefined;
        const route = data.route || data.relatedEntityRoute || data.related_entity_route || null;

        // If any client is focused, prefer to forward message to clients and avoid showing a system notification
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          const hasFocused = clientList.some((c) => c.focused);
          if (hasFocused) {
            clientList.forEach((client) => {
              client.postMessage({ type: 'fcm-message', payload: data });
            });
            return;
          }

          const options = {
            body: body,
            icon: '/branding/smart_rehab_icon.png',
            tag: tag,
            data: { route, data },
          };

          self.registration.showNotification(title, options);
        }).catch(() => {
          // Fallback: always show notification
          self.registration.showNotification(title, { body, icon: '/branding/smart_rehab_icon.png', tag, data: { route, data } });
        });
      } catch (e) {
        // swallow - nothing to do in SW
      }
    });

    // notificationclick handler: focus/open the app and pass route info
    self.addEventListener('notificationclick', function(event) {
      event.notification.close();
      const route = event.notification?.data?.route || null;

      event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            // If a client matches our origin, focus it and post a message to navigate
            if (client.url && 'focus' in client) {
              client.focus();
              if (route) {
                client.postMessage({ type: 'navigate', route });
              }
              return;
            }
          }

          // No existing client, open a new window
          const url = route ? new URL(route, self.location.origin).toString() : self.location.origin;
          return self.clients.openWindow(url);
        }),
      );
    });
  } catch (e) {
    // init failed
  }
}
