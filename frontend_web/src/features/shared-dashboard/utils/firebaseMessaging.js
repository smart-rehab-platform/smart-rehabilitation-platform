import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "../../../services/api";

let firebaseApp = null;
let messaging = null;

function readEnv(key, fallback = null) {
  return import.meta.env[key] ?? fallback;
}

export function initFirebaseClientIfNeeded() {
  if (firebaseApp) return firebaseApp;

  const apiKey = readEnv('VITE_FIREBASE_API_KEY');
  const authDomain = readEnv('VITE_FIREBASE_AUTH_DOMAIN');
  const projectId = readEnv('VITE_FIREBASE_PROJECT_ID');
  const storageBucket = readEnv('VITE_FIREBASE_STORAGE_BUCKET');
  const messagingSenderId = readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID');
  const appId = readEnv('VITE_FIREBASE_APP_ID');

  if (!projectId || !messagingSenderId) {
    // Not enough config to init
    return null;
  }

  const config = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  try {
    firebaseApp = initializeApp(config);
    messaging = getMessaging(firebaseApp);
    return firebaseApp;
  } catch (err) {
    return null;
  }
}

export async function registerServiceWorkerAndGetToken() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const vapidKey = readEnv('VITE_FIREBASE_VAPID_KEY');
  if (!vapidKey) {
    // VAPID key missing — caller should fail gracefully and user must provide it
    return null;
  }

  const app = initFirebaseClientIfNeeded();
  if (!app) return null;

  try {
    const swUrl = '/firebase-messaging-sw.js';

    // Register the real root-scoped worker only. Do NOT use blob: fallback.
    const registration = await navigator.serviceWorker.register(swUrl);
    console.info('[web-fcm] ServiceWorker.register() completed, scope:', registration.scope);

    // Wait for the service worker to become ready (active). navigator.serviceWorker.ready resolves when the
    // service worker controlling the page is active.
    try {
      const readyRegistration = await navigator.serviceWorker.ready;
      console.info('[web-fcm] navigator.serviceWorker.ready resolved');

      // If active is not present on readyRegistration, wait for activation on the returned registration
      if (!readyRegistration.active) {
        console.warn('[web-fcm] ready registration has no active worker yet; waiting for activation');

        // Wait for either the installing/waiting worker to reach 'activated' state, or timeout
        await new Promise((resolve) => {
          const reg = registration;
          const worker = reg.installing || reg.waiting;
          if (!worker) {
            // nothing to wait for; resolve after a short delay
            setTimeout(resolve, 3000);
            return;
          }

          const onState = () => {
            if (worker.state === 'activated') {
              worker.removeEventListener('statechange', onState);
              resolve();
            }
          };

          worker.addEventListener('statechange', onState);

          // Fallback timeout
          setTimeout(() => {
            try { worker.removeEventListener('statechange', onState); } catch (_) {}
            resolve();
          }, 8000);
        });
      }
    } catch (err) {
      console.error('[web-fcm] navigator.serviceWorker.ready rejected:', err?.message || err);
      // Continue — getToken will likely fail and be reported
    }

    // Re-obtain the ready registration to ensure it is active
    let finalReady = null;
    try {
      finalReady = await navigator.serviceWorker.ready;
      console.info('[web-fcm] final ready registration obtained; active exists:', !!finalReady.active);
    } catch (err) {
      console.error('[web-fcm] Error while obtaining final ready registration:', err?.message || err);
    }

    // Acquire token only with the ready registration (which should be active)
    let currentToken = null;
    try {
      console.info('[web-fcm] Calling getToken with serviceWorkerRegistration (active expected)');
      currentToken = await getToken(getMessaging(app), {
        vapidKey,
        serviceWorkerRegistration: finalReady || registration,
      });
    } catch (err) {
      // Log the raw error for diagnosis
      console.error('[web-fcm] getToken exception:', err?.code || err?.name || 'Error', '-', err?.message || err);
      return null;
    }

    if (!currentToken) {
      console.error('[web-fcm] getToken returned no token during registration');
      return null;
    }

    // Send token to backend using existing device-token registration API
    try {
      await api.post('/notifications/device-tokens', {
        device_token: currentToken,
        platform: 'web',
        device_name: navigator.userAgent ?? 'web',
      });
      console.info('[web-fcm] FCM token obtained and registered with backend (no token printed)');
    } catch (err) {
      console.error('[web-fcm] Failed to register web token with backend:', err?.message || err);
      // still return token — backend may be temporarily unavailable
    }

    // Listen for token refresh is not exposed in modular v9; getToken must be re-run when needed by caller
    return currentToken;
  } catch (err) {
    console.error('[web-fcm] Service worker registration failed:', err?.message || err);
    return null;
  }
}

export async function unregisterServiceWorkerToken() {
  const app = initFirebaseClientIfNeeded();
  if (!app) return null;

  try {
    // Attempt to find a token by calling getToken (may return null)
    const registration = await navigator.serviceWorker.getRegistration('/');
    const token = await getToken(getMessaging(app), { serviceWorkerRegistration: registration, vapidKey: readEnv('VITE_FIREBASE_VAPID_KEY') }).catch(() => null);
    if (token) {
      await api.delete('/notifications/device-tokens', { data: { device_token: token } }).catch(() => {});
    }
  } catch (err) {
    // ignore
  }
}

export function attachForegroundMessageHandler(onPayload) {
  const app = initFirebaseClientIfNeeded();
  if (!app || !onPayload) return null;

  return onMessage(getMessaging(app), (payload) => {
    // Only forward data payloads: let existing app polling logic handle in-app notifications.
    onPayload(payload);
  });
}
