import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useSessions } from "@/context/SessionsContext";
import { SessionCard } from "@/components/SessionCard";
import { EmptyState } from "@/components/EmptyState";
import { MAX_SESSIONS } from "@/types/session";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessions, createSession, canCreateMore } = useSessions();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCreate = () => {
    const session = createSession(newName);
    setCreating(false);
    setNewName("");
    if (session) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/browser/${session.id}`);
    }
  };

  const handleFAB = () => {
    if (!canCreateMore) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNewName("");
    setCreating(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
            <Feather name="layers" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Session Box</Text>
        </View>
        <Text style={[styles.headerCount, { color: colors.mutedForeground }]}>
          {sessions.length}/{MAX_SESSIONS}
        </Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.list,
          sessions.length === 0 && { flex: 1 },
          { paddingBottom: bottomPad + 90 },
        ]}
        ListEmptyComponent={<EmptyState />}
        scrollEnabled={sessions.length > 0}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() => router.push(`/browser/${item.id}`)}
          />
        )}
      />

      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: canCreateMore ? colors.primary : colors.muted,
            bottom: bottomPad + 24,
            shadowColor: colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={handleFAB}
      >
        <Feather name="plus" size={26} color={canCreateMore ? "#0d1117" : colors.mutedForeground} />
      </Pressable>

      {!canCreateMore && (
        <View style={[styles.limitBanner, { backgroundColor: colors.surface, borderColor: colors.border, bottom: bottomPad + 90 }]}>
          <Feather name="alert-circle" size={13} color={colors.mutedForeground} />
          <Text style={[styles.limitText, { color: colors.mutedForeground }]}>
            Maximum 8 sessions reached
          </Text>
        </View>
      )}

      <Modal visible={creating} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setCreating(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.foreground }]}>New Session</Text>
            <Text style={[styles.dialogSub, { color: colors.mutedForeground }]}>
              Each session has its own isolated cookies and storage.
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder={`Session ${sessions.length + 1}`}
              placeholderTextColor={colors.mutedForeground}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.dialogButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setCreating(false)}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 15, fontWeight: "500" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  styles.dialogBtnPrimary,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleCreate}
              >
                <Text style={{ color: "#0d1117", fontSize: 15, fontWeight: "700" }}>Create</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerCount: {
    fontSize: 13,
    fontWeight: "500",
  },
  list: {
    padding: 10,
  },
  fab: {
    position: "absolute",
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  limitBanner: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  limitText: {
    fontSize: 12,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  dialog: {
    width: 320,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    gap: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  dialogSub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  dialogButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  dialogBtnPrimary: {
    borderWidth: 0,
  },
});
