const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const REMEMBER_ME_KEY = "remember_me";
const SAVED_EMAIL_KEY = "saved_email";

const LEGACY_TOKEN_KEY = "accessToken";
const LEGACY_USER_KEY = "user";

let inMemoryToken = null;
let inMemoryUser = null;

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
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

function clearStorageAuthKeys(storage) {
  if (!storage) {
    return;
  }

  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
  storage.removeItem(LEGACY_TOKEN_KEY);
  storage.removeItem(LEGACY_USER_KEY);
}

function writeAuthToStorage(storage, token, user) {
  if (!storage || !token) {
    return;
  }

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(LEGACY_TOKEN_KEY, token);

  if (user) {
    const serializedUser = JSON.stringify(user);
    storage.setItem(USER_KEY, serializedUser);
    storage.setItem(LEGACY_USER_KEY, serializedUser);
  }
}

function getActiveAuthStorage() {
  return getRememberMePreference() ? getLocalStorage() : getSessionStorage();
}

export function getRememberMePreference() {
  const local = getLocalStorage();

  if (!local) {
    return false;
  }

  const rememberValue = local.getItem(REMEMBER_ME_KEY);
  if (rememberValue === null) {
    return Boolean(local.getItem(TOKEN_KEY) || local.getItem(LEGACY_TOKEN_KEY));
  }

  return rememberValue === "true";
}

export function shouldAllowRefreshFromCookie() {
  if (getRememberMePreference()) {
    return true;
  }

  const session = getSessionStorage();
  if (!session) {
    return false;
  }

  return Boolean(
    session.getItem(TOKEN_KEY) || session.getItem(LEGACY_TOKEN_KEY),
  );
}

export function getSavedEmail() {
  const local = getLocalStorage();

  if (!local || !getRememberMePreference()) {
    return "";
  }

  return local.getItem(SAVED_EMAIL_KEY) || "";
}

export function getStoredAccessToken() {
  if (inMemoryToken) {
    return inMemoryToken;
  }

  const storage = getActiveAuthStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(TOKEN_KEY) || storage.getItem(LEGACY_TOKEN_KEY);
}

export function getAuthToken() {
  return getStoredAccessToken();
}

export function getStoredUser() {
  if (inMemoryUser) {
    return inMemoryUser;
  }

  const storage = getActiveAuthStorage();
  if (!storage) {
    return null;
  }

  return readJson(storage.getItem(USER_KEY) || storage.getItem(LEGACY_USER_KEY));
}

export function getCurrentUser() {
  return getStoredUser();
}

export function getPersistedToken() {
  return getStoredAccessToken();
}

export function getPersistedUser() {
  return getStoredUser();
}

export function hasStoredAuthSession() {
  return Boolean(getStoredAccessToken() && getStoredUser());
}

export function storeAuthSession({ accessToken, token, user, rememberMe, email }) {
  const resolvedToken = accessToken || token;
  if (!resolvedToken || !user) {
    return;
  }

  inMemoryToken = resolvedToken;
  inMemoryUser = user;

  const local = getLocalStorage();
  const session = getSessionStorage();

  if (rememberMe) {
    writeAuthToStorage(local, resolvedToken, user);
    clearStorageAuthKeys(session);

    if (local) {
      local.setItem(REMEMBER_ME_KEY, "true");
      if (email) {
        local.setItem(SAVED_EMAIL_KEY, email);
      }
    }
    return;
  }

  writeAuthToStorage(session, resolvedToken, user);
  clearStorageAuthKeys(local);

  if (local) {
    local.setItem(REMEMBER_ME_KEY, "false");
    local.removeItem(SAVED_EMAIL_KEY);
  }
}

export function updateStoredAccessToken(accessToken, user) {
  if (!accessToken) {
    return;
  }

  inMemoryToken = accessToken;

  if (user) {
    inMemoryUser = user;
  }

  writeAuthToStorage(getActiveAuthStorage(), accessToken, user ?? inMemoryUser);
}

export function saveRememberedSession({ token, user, email }) {
  storeAuthSession({ token, user, rememberMe: true, email });
}

export function saveTemporarySession({ token, user }) {
  storeAuthSession({ token, user, rememberMe: false });
}

export function syncRestoredSession({ token, user }) {
  updateStoredAccessToken(token, user);
}

export function clearPersistedSession({ clearRememberedLogin = false } = {}) {
  clearStorageAuthKeys(getLocalStorage());
  clearStorageAuthKeys(getSessionStorage());

  const local = getLocalStorage();
  if (local && clearRememberedLogin) {
    local.removeItem(REMEMBER_ME_KEY);
    local.removeItem(SAVED_EMAIL_KEY);
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
