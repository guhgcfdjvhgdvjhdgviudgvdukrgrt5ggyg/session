import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Extension, BUILT_IN_EXTENSIONS } from "@/types/extension";

const EXTENSIONS_KEY = (sessionId: string) => `@session_extensions_${sessionId}`;

interface ExtensionsContextValue {
  getExtensions: (sessionId: string) => Extension[];
  installExtension: (sessionId: string, ext: Extension) => void;
  uninstallExtension: (sessionId: string, extensionId: string) => void;
  toggleExtension: (sessionId: string, extensionId: string) => void;
  addCustomExtension: (sessionId: string, name: string, script: string, icon?: string) => void;
  getActiveScripts: (sessionId: string) => string[];
  clearExtensions: (sessionId: string) => void;
}

const ExtensionsContext = createContext<ExtensionsContextValue | null>(null);

export function ExtensionsProvider({ children }: { children: React.ReactNode }) {
  const [extensionsMap, setExtensionsMap] = useState<Record<string, Extension[]>>({});
  const saveTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const persist = useCallback((sessionId: string, exts: Extension[]) => {
    const existing = saveTimeouts.current.get(sessionId);
    if (existing) clearTimeout(existing);
    const timeout = setTimeout(() => {
      AsyncStorage.setItem(EXTENSIONS_KEY(sessionId), JSON.stringify(exts));
      saveTimeouts.current.delete(sessionId);
    }, 300);
    saveTimeouts.current.set(sessionId, timeout);
  }, []);

  const loadExtensions = useCallback(async (sessionId: string) => {
    const raw = await AsyncStorage.getItem(EXTENSIONS_KEY(sessionId));
    if (raw) {
      try {
        const loaded: Extension[] = JSON.parse(raw);
        setExtensionsMap((prev) => ({ ...prev, [sessionId]: loaded }));
        return loaded;
      } catch {
        // ignore
      }
    }
    return [];
  }, []);

  useEffect(() => {
    return () => {
      saveTimeouts.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const getExtensions = useCallback(
    (sessionId: string): Extension[] => {
      if (!extensionsMap[sessionId]) {
        // lazy load
        loadExtensions(sessionId);
        return [];
      }
      return extensionsMap[sessionId] || [];
    },
    [extensionsMap, loadExtensions],
  );

  const installExtension = useCallback(
    (sessionId: string, ext: Extension) => {
      setExtensionsMap((prev) => {
        const current = prev[sessionId] || [];
        if (current.some((e) => e.id === ext.id)) return prev;
        const updated = [...current, ext];
        persist(sessionId, updated);
        return { ...prev, [sessionId]: updated };
      });
    },
    [persist],
  );

  const uninstallExtension = useCallback(
    (sessionId: string, extensionId: string) => {
      setExtensionsMap((prev) => {
        const current = prev[sessionId] || [];
        const updated = current.filter((e) => e.id !== extensionId);
        persist(sessionId, updated);
        return { ...prev, [sessionId]: updated };
      });
    },
    [persist],
  );

  const toggleExtension = useCallback(
    (sessionId: string, extensionId: string) => {
      setExtensionsMap((prev) => {
        const current = prev[sessionId] || [];
        const updated = current.map((e) =>
          e.id === extensionId ? { ...e, enabled: !e.enabled } : e,
        );
        persist(sessionId, updated);
        return { ...prev, [sessionId]: updated };
      });
    },
    [persist],
  );

  const addCustomExtension = useCallback(
    (sessionId: string, name: string, script: string, icon = "code") => {
      const ext: Extension = {
        id: "custom_" + Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name,
        description: "Custom extension",
        icon,
        script,
        enabled: true,
        builtIn: false,
      };
      setExtensionsMap((prev) => {
        const current = prev[sessionId] || [];
        const updated = [...current, ext];
        persist(sessionId, updated);
        return { ...prev, [sessionId]: updated };
      });
    },
    [persist],
  );

  const getActiveScripts = useCallback(
    (sessionId: string): string[] => {
      const exts = extensionsMap[sessionId] || [];
      return exts.filter((e) => e.enabled).map((e) => e.script);
    },
    [extensionsMap],
  );

  const clearExtensions = useCallback(
    (sessionId: string) => {
      setExtensionsMap((prev) => {
        const { [sessionId]: _, ...rest } = prev;
        return rest;
      });
      AsyncStorage.removeItem(EXTENSIONS_KEY(sessionId));
    },
    [],
  );

  return (
    <ExtensionsContext.Provider
      value={{
        getExtensions,
        installExtension,
        uninstallExtension,
        toggleExtension,
        addCustomExtension,
        getActiveScripts,
        clearExtensions,
      }}
    >
      {children}
    </ExtensionsContext.Provider>
  );
}

export function useExtensions() {
  const ctx = useContext(ExtensionsContext);
  if (!ctx) throw new Error("useExtensions must be used within ExtensionsProvider");
  return ctx;
}
