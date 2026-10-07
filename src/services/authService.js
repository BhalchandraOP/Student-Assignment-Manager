const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api';
const SESSION_KEY = 'student-tracker-auth';
export async function login(credentials) {
  const response = await fetch(`${API_URL}/auth/login`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials)});
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? 'Unable to sign in. Please try again.');
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  return payload;
}
export function getSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!session?.accessToken || new Date(session.expiresAt) <= new Date()) { sessionStorage.removeItem(SESSION_KEY); return null; }
    return session;
  } catch { sessionStorage.removeItem(SESSION_KEY); return null; }
}
export function logout() { sessionStorage.removeItem(SESSION_KEY); }

export async function fetchWithAuth(endpoint, options = {}) {
  const session = getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    ...(options.headers || {}),
  };

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}
