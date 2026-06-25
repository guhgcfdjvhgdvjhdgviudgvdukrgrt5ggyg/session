export interface Session {
  id: string;
  name: string;
  lastUrl: string;
  createdAt: number;
  colorIndex: number;
  userAgent?: string;
  labels: string[];
}

export const DESKTOP_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export const SESSION_COLORS = [
  "#00d4aa",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#ec4899",
  "#eab308",
  "#14b8a6",
  "#ef4444",
];

export const MAX_SESSIONS = 99;
