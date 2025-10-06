// Lightweight session helper for the demo app
const SESSION_KEY = 'library_session';
const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function nowIso() {
  return new Date().toISOString();
}

export function createSession(name) {
  const session = {
    name,
    loginTime: nowIso(),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    borrowed: [],
  };
  saveSession(session);
  return session;
}

export function getRaw() {
  return sessionStorage.getItem(SESSION_KEY);
}

export function getSession() {
  const raw = getRaw();
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s.expiresAt) return null;
    if (new Date(s.expiresAt).getTime() <= Date.now()) {
      // expired
      clearSession();
      return null;
    }
    return s;
  } catch (e) {
    clearSession();
    return null;
  }
}

export function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function refreshSession(session) {
  if (!session) return null;
  session.expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  saveSession(session);
  return session;
}

export function timeLeftMs(session) {
  if (!session || !session.expiresAt) return 0;
  return Math.max(0, new Date(session.expiresAt).getTime() - Date.now());
}

export default {
  createSession,
  getSession,
  saveSession,
  clearSession,
  refreshSession,
  timeLeftMs,
};
