export interface Session {
  id: string;
  name: string;
  lastUrl: string;
  createdAt: number;
  colorIndex: number;
}

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

export const MAX_SESSIONS = 8;
