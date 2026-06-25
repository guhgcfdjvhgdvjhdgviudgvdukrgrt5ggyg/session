import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useNetwork } from "@/context/NetworkContext";

export function NetworkBanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetwork();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isConnected ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, anim]);

  const topOffset = Platform.OS === "web" ? 0 : insets.top;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: "#ea580c",
          paddingTop: topOffset + 4,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-60, 0],
              }),
            },
          ],
          opacity: anim,
        },
      ]}
      pointerEvents={isConnected ? "none" : "auto"}
    >
      <View style={styles.inner}>
        <Feather name="wifi-off" size={14} color="#fff" />
        <Text style={styles.text}>Reconnecting...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingBottom: 6,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});
