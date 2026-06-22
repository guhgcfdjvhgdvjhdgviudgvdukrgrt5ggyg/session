import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const ONBOARDING_KEY = "@session_box_onboarding_done";

const STEPS = [
  {
    icon: "layers" as const,
    title: "Isolated Sessions",
    desc: "Each session has its own cookies, storage, and data — just like separate browser profiles.",
  },
  {
    icon: "globe" as const,
    title: "Browse Freely",
    desc: "Log into different accounts in different sessions without cross-contamination.",
  },
  {
    icon: "monitor" as const,
    title: "Desktop Mode",
    desc: "Enable Desktop Mode to access desktop-only sites like the Chrome Web Store.",
  },
  {
    icon: "trash-2" as const,
    title: "Full Control",
    desc: "Delete sessions anytime. Cookies and data are cleaned up automatically.",
  },
];

export async function isOnboardingDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === "true";
}

export async function markOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export function Onboarding() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    isOnboardingDone().then((done) => {
      if (!done) {
        setVisible(true);
        setTimeout(() => {
          setShow(true);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 1,
              damping: 20,
              stiffness: 90,
              useNativeDriver: true,
            }),
          ]).start();
        }, 300);
      }
    });
  }, []);

  const next = () => {
    if (step < STEPS.length - 1) {
      const anim = new Animated.Value(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setStep(step + 1);
      });
    } else {
      finish();
    }
  };

  const finish = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      markOnboardingDone();
      setShow(false);
      setVisible(false);
    });
  };

  if (!visible) return null;

  const s = STEPS[step];
  const sw = Dimensions.get("window").width;
  const dotWidth = (sw - 32 - (STEPS.length - 1) * 6) / STEPS.length;

  return (
    <Modal visible={show} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
            <Feather name={s.icon} size={40} color={colors.primary} />
          </View>

          <View style={styles.steps}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    backgroundColor: i === step ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>{s.title}</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{s.desc}</Text>

          <View style={styles.actions}>
            {step < STEPS.length - 1 ? (
              <>
                <TouchableOpacity onPress={finish} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[styles.skip, { color: colors.mutedForeground }]}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, { backgroundColor: colors.primary }]}
                  onPress={next}
                >
                  <Text style={[styles.nextText, { color: colors.primaryForeground }]}>Next</Text>
                  <Feather name="arrow-right" size={16} color={colors.primaryForeground} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.nextBtn, styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={finish}
              >
                <Feather name="layers" size={16} color={colors.primaryForeground} />
                <Text style={[styles.nextText, { color: colors.primaryForeground }]}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 20,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  steps: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  desc: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  skip: {
    fontSize: 15,
    fontWeight: "500",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtn: {
    flex: 1,
    justifyContent: "center",
  },
  nextText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
