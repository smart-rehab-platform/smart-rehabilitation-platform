const admin = require("firebase-admin");

const ENV_SERVICE_ACCOUNT_JSON = "FIREBASE_SERVICE_ACCOUNT_JSON";

/**
 * Resolve Firebase Admin credentials.
 * Railway: set FIREBASE_SERVICE_ACCOUNT_JSON to the full service-account JSON string.
 * Local: omit it and use Application Default Credentials (ADC).
 */
const resolveFirebaseCredential = () => {
  const raw = String(process.env[ENV_SERVICE_ACCOUNT_JSON] || "").trim();

  if (!raw) {
    return {
      mode: "application-default",
      credential: admin.credential.applicationDefault(),
    };
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (error) {
    console.error(
      "[firebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON (invalid JSON).",
      error.message,
    );
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON.",
    );
  }

  if (
    !serviceAccount ||
    typeof serviceAccount !== "object" ||
    Array.isArray(serviceAccount)
  ) {
    console.error(
      "[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON must be a JSON object.",
    );
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON must be a service-account JSON object.",
    );
  }

  if (
    typeof serviceAccount.private_key === "string" &&
    serviceAccount.private_key.includes("\\n")
  ) {
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      "\n",
    );
  }

  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    console.error(
      "[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is missing client_email or private_key.",
    );
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is missing required service-account fields.",
    );
  }

  try {
    return {
      mode: "service-account-json",
      credential: admin.credential.cert(serviceAccount),
    };
  } catch (error) {
    console.error(
      "[firebaseAdmin] Failed to create credential from FIREBASE_SERVICE_ACCOUNT_JSON:",
      error.message,
    );
    throw error;
  }
};

if (!admin.apps.length) {
  try {
    const { credential, mode } = resolveFirebaseCredential();
    admin.initializeApp({ credential });
    console.info(`[firebaseAdmin] Initialized using ${mode}.`);
  } catch (error) {
    console.error(
      "[firebaseAdmin] Initialization failed:",
      error.message || error,
    );
    throw error;
  }
}

module.exports = admin;
module.exports.resolveFirebaseCredential = resolveFirebaseCredential;
module.exports.ENV_SERVICE_ACCOUNT_JSON = ENV_SERVICE_ACCOUNT_JSON;
