const TOKEN_KEY = 'epa_auth_token';
const ROLE_KEY = 'epa_auth_role';
const WORKSHOP_KEY = 'epa_auth_workshop_id';

export interface AuthSession {
  token: string;
  role: string;
  workshopId: number | null;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function getAuthWorkshopId(): number | null {
  const raw = localStorage.getItem(WORKSHOP_KEY);
  return raw ? Number(raw) : null;
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(ROLE_KEY, session.role);
  if (session.workshopId !== null) {
    localStorage.setItem(WORKSHOP_KEY, String(session.workshopId));
  } else {
    localStorage.removeItem(WORKSHOP_KEY);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(WORKSHOP_KEY);
}

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
