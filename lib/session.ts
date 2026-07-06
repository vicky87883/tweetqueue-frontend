export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
};

export type Session = {
  token: string;
  user: SessionUser;
};

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';

function getStorage() {
  if (typeof window === 'undefined' || !('localStorage' in window)) return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  return readSession(TOKEN_KEY, USER_KEY);
}

export function getAdminSession(): Session | null {
  return readSession(ADMIN_TOKEN_KEY, ADMIN_USER_KEY);
}

function readSession(tokenKey: string, userKey: string): Session | null {
  const storage = getStorage();
  if (!storage) return null;

  const token = storage.getItem(tokenKey);
  const rawUser = storage.getItem(userKey);

  if (!token || !rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as SessionUser;
    if (!user?.id || !user?.email) return null;
    return { token, user };
  } catch {
    clearStoredSession(tokenKey, userKey);
    return null;
  }
}

export function saveSession(session: Session) {
  writeSession(session, TOKEN_KEY, USER_KEY);
}

export function saveAdminSession(session: Session) {
  writeSession(session, ADMIN_TOKEN_KEY, ADMIN_USER_KEY);
}

function writeSession(session: Session, tokenKey: string, userKey: string) {
  const storage = getStorage();
  if (!storage) {
    throw new Error('Browser storage is unavailable. Enable local storage to sign in.');
  }

  storage.setItem(tokenKey, session.token);
  storage.setItem(userKey, JSON.stringify(session.user));
}

export function clearSession() {
  clearStoredSession(TOKEN_KEY, USER_KEY);
}

export function clearAdminSession() {
  clearStoredSession(ADMIN_TOKEN_KEY, ADMIN_USER_KEY);
}

function clearStoredSession(tokenKey: string, userKey: string) {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(tokenKey);
  storage.removeItem(userKey);
}
