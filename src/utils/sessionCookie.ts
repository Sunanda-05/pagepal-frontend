const SESSION_COOKIE_NAME = "pagepal_session";
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const PAGEPAL_SESSION_COOKIE = SESSION_COOKIE_NAME;

export function setSessionCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${SESSION_COOKIE_NAME}=active; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
