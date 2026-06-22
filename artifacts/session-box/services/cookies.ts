import AsyncStorage from "@react-native-async-storage/async-storage";

const COOKIE_PREFIX = "@session_cookies_";

function storageKey(sessionId: string): string {
  return `${COOKIE_PREFIX}${sessionId}`;
}

export async function loadCookies(sessionId: string): Promise<string> {
  const raw = await AsyncStorage.getItem(storageKey(sessionId));
  return raw ?? "";
}

export async function saveCookies(sessionId: string, cookieStr: string): Promise<void> {
  const trimmed = cookieStr.trim();
  if (!trimmed) return;
  await AsyncStorage.setItem(storageKey(sessionId), trimmed);
}

export async function clearCookies(sessionId: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey(sessionId));
}

export function buildCookieScript(cookieStr: string): string {
  if (!cookieStr.trim()) return "";
  const cookies = cookieStr.split(";").map((c) => c.trim()).filter(Boolean);
  const sets = cookies.map((c) => `document.cookie=${JSON.stringify(c)};`).join("");
  return `${sets}true;`;
}

export function buildCookieReadScript(): string {
  return `window.ReactNativeWebView.postMessage(JSON.stringify({ type: "__cookies", cookies: document.cookie })); true;`;
}

export function isCookieMessage(data: unknown): data is { type: "__cookies"; cookies: string } {
  return typeof data === "object" && data !== null && (data as any).type === "__cookies";
}
