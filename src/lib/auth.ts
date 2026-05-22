const TOKEN_KEY = "mini_erp_token";
const USER_KEY = "mini_erp_user";
const LOGIN_AT_KEY = "mini_erp_login_at";
const SESSION_DURATION_MS = 5 * 60 * 60 * 1000;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(LOGIN_AT_KEY, Date.now().toString());
}

export function isSessionExpired(): boolean {
  if (typeof window === "undefined") return false;
  const loginAt = localStorage.getItem(LOGIN_AT_KEY);
  if (!loginAt) return true;
  return Date.now() - parseInt(loginAt, 10) > SESSION_DURATION_MS;
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGIN_AT_KEY);
}

export function isAdmin(user: AuthUser | null) {
  return user?.role === "ADMIN";
}
