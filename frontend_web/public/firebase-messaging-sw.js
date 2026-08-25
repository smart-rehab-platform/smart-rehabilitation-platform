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

  Web push architecture:
  - Backend sends data-only FCM messages for web tokens (no top-level `notification`).
  - This service worker is the ONLY OS desktop notification displayer.
*/

importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// === Injected by scripts/generate-sw.cjs from VITE_FIREBASE_* env vars ===
const FIREBASE_CONFIG = {
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "__FIREBASE_AUTH_DOMAIN__",
  projectId: "__FIREBASE_PROJECT_ID__",
  storageBucket: "__FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__",
  measurementId: "__FIREBASE_MEASUREMENT_ID__",
};
// ========================================================================

if (typeof firebase === 'undefined') {
  // firebase scripts failed to load
} else {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    const messaging = firebase.messaging();

    // Handle background / data-only messages. Sole Web desktop display path.
    messaging.onBackgroundMessage(function(payload) {
      try {
        const data = payload?.data || {};
        const title = (data.title && String(data.title).trim())
          || 'Smart Rehabilitation';
        const body = (data.body && String(data.body).trim()) || '';
        const notificationId = data.notificationId || data.notification_id || '';
        const tag = notificationId
          ? `smart-rehab-${notificationId}`
          : undefined;
        const route = data.route || data.relatedEntityRoute || data.related_entity_route || null;

        // If any client is focused, forward data for in-app refresh and skip OS toast.
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
            icon: '/branding/smart_rehab_notification_icon.png',
            tag: tag,
            renotify: false,
            data: {
              route,
              notificationId: notificationId || null,
              type: data.type || null,
              relatedEntityType: data.relatedEntityType || data.related_entity_type || null,
              relatedEntityId: data.relatedEntityId || data.related_entity_id || null,
              data,
            },
          };

          self.registration.showNotification(title, options);
        }).catch(() => {
          self.registration.showNotification(title, {
            body,
            icon: '/branding/smart_rehab_notification_icon.png',
            tag,
            renotify: false,
            data: { route, data },
          });
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
