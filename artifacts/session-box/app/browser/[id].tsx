// @ts-nocheck
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import WebView, { WebViewNavigation } from "react-native-webview";
import { useColors } from "@/hooks/useColors";
import { useSessions } from "@/context/SessionsContext";
import { SESSION_COLORS } from "@/types/session";

const DEFAULT_URL = "https://www.google.com";

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_URL;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.includes(".") && !trimmed.includes(" ")) return `https://${trimmed}`;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

export default function BrowserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { getSession, updateLastUrl } = useSessions();
  const session = getSession(id);

  const webViewRef = useRef<WebView>(null);
  const [urlText, setUrlText] = useState(session?.lastUrl || DEFAULT_URL);
  const [currentUrl, setCurrentUrl] = useState(session?.lastUrl || DEFAULT_URL);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [editingUrl, setEditingUrl] = useState(false);

  const accent = session ? SESSION_COLORS[session.colorIndex] ?? colors.primary : colors.primary;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleNavigationStateChange = useCallback(
    (nav: WebViewNavigation) => {
      setCanGoBack(nav.canGoBack);
      setCanGoForward(nav.canGoForward);
      if (nav.url) {
        setCurrentUrl(nav.url);
        setUrlText(nav.url);
        if (!nav.loading && id) {
          updateLastUrl(id, nav.url);
        }
      }
    },
    [id, updateLastUrl],
  );

  const handleGo = () => {
    Keyboard.dismiss();
    const url = normalizeUrl(urlText);
    setUrlText(url);
    setCurrentUrl(url);
    setEditingUrl(false);
    webViewRef.current?.injectJavaScript(`window.location.href = '${url.replace(/'/g, "\\'")}'; true;`);
  };

  const displayUrl = currentUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  if (!session) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>Session not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.5 }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          </Pressable>

          <View style={[styles.urlBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.sessionDot, { backgroundColor: accent }]} />
            {editingUrl ? (
              <TextInput
                style={[styles.urlInput, { color: colors.foreground }]}
                value={urlText}
                onChangeText={setUrlText}
                autoFocus
                selectTextOnFocus
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={handleGo}
                onBlur={() => {
                  setEditingUrl(false);
                  setUrlText(currentUrl);
                }}
                placeholderTextColor={colors.mutedForeground}
                placeholder="Search or enter URL"
              />
            ) : (
              <Pressable
                style={styles.urlDisplay}
                onPress={() => {
                  setUrlText(currentUrl);
                  setEditingUrl(true);
                }}
              >
                <Text style={[styles.urlDisplayText, { color: colors.foreground }]} numberOfLines={1}>
                  {displayUrl || "New Tab"}
                </Text>
              </Pressable>
            )}
            {loading ? (
              <ActivityIndicator size="small" color={accent} style={{ marginRight: 4 }} />
            ) : (
              <Pressable
                onPress={() => webViewRef.current?.reload()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => pressed && { opacity: 0.5 }}
              >
                <Feather name="refresh-cw" size={15} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>

        {loadProgress > 0 && loadProgress < 1 && (
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBar, { width: `${loadProgress * 100}%` as any, backgroundColor: accent }]} />
          </View>
        )}
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: normalizeUrl(session.lastUrl || DEFAULT_URL) }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onLoadProgress={({ nativeEvent }) => setLoadProgress(nativeEvent.progress)}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
        incognito={false}
        sharedCookiesEnabled={false}
        cacheEnabled
      />

      <View style={[styles.bottomBar, { paddingBottom: bottomPad + 8, borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <Pressable
          onPress={() => {
            if (canGoBack) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              webViewRef.current?.goBack();
            }
          }}
          style={({ pressed }) => [styles.navBtn, !canGoBack && styles.navBtnDisabled, pressed && { opacity: 0.5 }]}
          disabled={!canGoBack}
        >
          <Feather name="arrow-left" size={20} color={canGoBack ? colors.foreground : colors.mutedForeground} />
        </Pressable>

        <Pressable
          onPress={() => {
            if (canGoForward) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              webViewRef.current?.goForward();
            }
          }}
          style={({ pressed }) => [styles.navBtn, !canGoForward && styles.navBtnDisabled, pressed && { opacity: 0.5 }]}
          disabled={!canGoForward}
        >
          <Feather name="arrow-right" size={20} color={canGoForward ? colors.foreground : colors.mutedForeground} />
        </Pressable>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            webViewRef.current?.reload();
          }}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.5 }]}
        >
          <Feather name="refresh-cw" size={20} color={colors.foreground} />
        </Pressable>

        <View style={[styles.sessionPill, { backgroundColor: accent + "20", borderColor: accent + "50" }]}>
          <View style={[styles.sessionDotLg, { backgroundColor: accent }]} />
          <Text style={[styles.sessionLabel, { color: accent }]} numberOfLines={1}>
            {session.name}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            webViewRef.current?.injectJavaScript(`window.location.href = '${DEFAULT_URL}'; true;`);
          }}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.5 }]}
        >
          <Feather name="home" size={20} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  urlBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  urlDisplay: {
    flex: 1,
    justifyContent: "center",
    height: 38,
  },
  urlDisplayText: {
    fontSize: 13,
    fontWeight: "500",
  },
  urlInput: {
    flex: 1,
    fontSize: 13,
    height: 38,
    padding: 0,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: 2,
    borderRadius: 1,
  },
  webview: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 2,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  sessionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 160,
    marginHorizontal: 4,
  },
  sessionDotLg: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    flexShrink: 0,
  },
  sessionLabel: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
});
