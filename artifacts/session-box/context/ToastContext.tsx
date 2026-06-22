import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: keyof typeof Feather.glyphMap;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, icon?: keyof typeof Feather.glyphMap) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, keyof typeof Feather.glyphMap> = {
  success: "check-circle",
  error: "alert-circle",
  warning: "alert-triangle",
  info: "info",
};

const COLORS: Record<ToastType, string> = {
  success: "#00d4aa",
  error: "#f85149",
  warning: "#f97316",
  info: "#3b82f6",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fadeAnims = useRef<Map<string, Animated.Value>>(new Map());

  const removeToast = useCallback((id: string) => {
    const anim = fadeAnims.current.get(id);
    if (anim) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        fadeAnims.current.delete(id);
      });
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", icon?: keyof typeof Feather.glyphMap) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      const anim = new Animated.Value(0);
      fadeAnims.current.set(id, anim);

      setToasts((prev) => [...prev, { id, message, type, icon }]);

      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }).start();

      setTimeout(() => removeToast(id), 3000);
    },
    [removeToast],
  );

  const topOffset = Platform.OS === "web" ? 16 : insets.top + 8;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.container, { top: topOffset }]} pointerEvents="box-none">
        {toasts.map((toast) => {
          const anim = fadeAnims.current.get(toast.id);
          if (!anim) return null;
          const typeColor = COLORS[toast.type];
          return (
            <Animated.View
              key={toast.id}
              style={[
                styles.toast,
                {
                  backgroundColor: colors.surface,
                  borderColor: typeColor + "40",
                  borderLeftColor: typeColor,
                  opacity: anim,
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Feather
                name={toast.icon || ICONS[toast.type]}
                size={16}
                color={typeColor}
              />
              <Text
                style={[styles.message, { color: colors.foreground }]}
                numberOfLines={2}
              >
                {toast.message}
              </Text>
              <TouchableOpacity
                onPress={() => removeToast(toast.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 8,
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
