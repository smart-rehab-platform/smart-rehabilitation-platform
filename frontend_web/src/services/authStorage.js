const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const REMEMBER_ME_KEY = "remember_me";
const SAVED_EMAIL_KEY = "saved_email";

const LEGACY_TOKEN_KEY = "accessToken";
const LEGACY_USER_KEY = "user";

let inMemoryToken = null;
let inMemoryUser = null;

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function readJson(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  const storage = getStorage();

  if (!storage || !user) {
    return;
  }

  const serializedUser = JSON.stringify(user);
  storage.setItem(USER_KEY, serializedUser);
  storage.setItem(LEGACY_USER_KEY, serializedUser);
}

export function getRememberMePreference() {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  const rememberValue = storage.getItem(REMEMBER_ME_KEY);
  if (rememberValue === null) {
    return Boolean(storage.getItem(TOKEN_KEY) || storage.getItem(LEGACY_TOKEN_KEY));
  }

  return rememberValue === "true";
}

export function getSavedEmail() {
  const storage = getStorage();

  if (!storage || !getRememberMePreference()) {
    return "";
  }

  return storage.getItem(SAVED_EMAIL_KEY) || "";
}

export function getPersistedToken() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  return storage.getItem(TOKEN_KEY) || storage.getItem(LEGACY_TOKEN_KEY);
}

export function getPersistedUser() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  return readJson(storage.getItem(USER_KEY) || storage.getItem(LEGACY_USER_KEY));
}

export function getAuthToken() {
  if (inMemoryToken) {
    return inMemoryToken;
  }

  if (!getRememberMePreference()) {
    return null;
  }

  return getPersistedToken();
}

export function getCurrentUser() {
  if (inMemoryUser) {
    return inMemoryUser;
  }

  if (!getRememberMePreference()) {
    return null;
  }

  return getPersistedUser();
}

export function saveRememberedSession({ token, user, email }) {
  const storage = getStorage();

  inMemoryToken = token;
  inMemoryUser = user;

  if (!storage) {
    return;
  }

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(LEGACY_TOKEN_KEY, token);
  writeStoredUser(user);
  storage.setItem(REMEMBER_ME_KEY, "true");
  storage.setItem(SAVED_EMAIL_KEY, email);
}

export function saveTemporarySession({ token, user }) {
  const storage = getStorage();

  inMemoryToken = token;
  inMemoryUser = user;

  clearPersistedSession();

  if (!storage) {
    return;
  }

  storage.setItem(REMEMBER_ME_KEY, "false");
  storage.removeItem(SAVED_EMAIL_KEY);
}

export function syncRestoredSession({ token, user }) {
  inMemoryToken = token;
  inMemoryUser = user;

  if (!getRememberMePreference()) {
    return;
  }

  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(LEGACY_TOKEN_KEY, token);
  writeStoredUser(user);
}

export function clearPersistedSession({ clearRememberedLogin = false } = {}) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
  storage.removeItem(LEGACY_TOKEN_KEY);
  storage.removeItem(LEGACY_USER_KEY);

  if (clearRememberedLogin) {
    storage.removeItem(REMEMBER_ME_KEY);
    storage.removeItem(SAVED_EMAIL_KEY);
  }
}

export function clearAuthSession(options = {}) {
  inMemoryToken = null;
  inMemoryUser = null;
  clearPersistedSession(options);
}

export function loadRememberedLogin() {
  const rememberMe = getRememberMePreference();

  return {
    rememberMe,
    email: rememberMe ? getSavedEmail() : "",
  };
}
