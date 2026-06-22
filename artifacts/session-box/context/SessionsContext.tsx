import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, MAX_SESSIONS, SESSION_COLORS } from "@/types/session";
import { clearCookies } from "@/services/cookies";
import { clearSessionExtensions } from "@/services/extensions";

const STORAGE_KEY = "@session_box_sessions";

interface SessionsContextValue {
  sessions: Session[];
  createSession: (name: string, userAgent?: string) => Session | null;
  deleteSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  updateLastUrl: (id: string, url: string) => void;
  getSession: (id: string) => Session | undefined;
  canCreateMore: boolean;
}

const SessionsContext = createContext<SessionsContextValue | null>(null);

export function SessionsProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setSessions(JSON.parse(raw));
        } catch {
          setSessions([]);
        }
      }
    });
  }, []);

  const persist = useCallback((updated: Session[]) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }, 300);
  }, []);

  const createSession = useCallback(
    (name: string, userAgent?: string): Session | null => {
      if (sessions.length >= MAX_SESSIONS) return null;
      const usedColors = sessions.map((s) => s.colorIndex);
      let colorIndex = 0;
      for (let i = 0; i < SESSION_COLORS.length; i++) {
        if (!usedColors.includes(i)) {
          colorIndex = i;
          break;
        }
      }
      const session: Session = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        name: name.trim() || `Session ${sessions.length + 1}`,
        lastUrl: "",
        createdAt: Date.now(),
        colorIndex,
        ...(userAgent ? { userAgent } : {}),
      };
      const updated = [...sessions, session];
      setSessions(updated);
      persist(updated);
      return session;
    },
    [sessions, persist],
  );

  const deleteSession = useCallback(
    (id: string) => {
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);
      persist(updated);
      clearCookies(id);
      clearSessionExtensions(id);
    },
    [sessions, persist],
  );

  const renameSession = useCallback(
    (id: string, name: string) => {
      const updated = sessions.map((s) =>
        s.id === id ? { ...s, name: name.trim() || s.name } : s,
      );
      setSessions(updated);
      persist(updated);
    },
    [sessions, persist],
  );

  const updateLastUrl = useCallback(
    (id: string, url: string) => {
      setSessions((prev) => {
        const updated = prev.map((s) => (s.id === id ? { ...s, lastUrl: url } : s));
        persist(updated);
        return updated;
      });
    },
    [persist],
  );

  const getSession = useCallback(
    (id: string) => sessions.find((s) => s.id === id),
    [sessions],
  );

  return (
    <SessionsContext.Provider
      value={{
        sessions,
        createSession,
        deleteSession,
        renameSession,
        updateLastUrl,
        getSession,
        canCreateMore: sessions.length < MAX_SESSIONS,
      }}
    >
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const ctx = useContext(SessionsContext);
  if (!ctx) throw new Error("useSessions must be used within SessionsProvider");
  return ctx;
}
