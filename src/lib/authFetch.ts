const TOKEN_KEY = 'epa_auth_token';
const ROLE_KEY = 'epa_auth_role';
const WORKSHOP_IDS_KEY = 'epa_auth_workshop_ids';

export interface AuthSession {
  token: string;
  role: string;
  workshopIds: number[];
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function getAuthWorkshopIds(): number[] {
  const raw = localStorage.getItem(WORKSHOP_IDS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setAuthSession(session: AuthSession) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(ROLE_KEY, session.role);
  localStorage.setItem(WORKSHOP_IDS_KEY, JSON.stringify(session.workshopIds));
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(WORKSHOP_IDS_KEY);
}

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
