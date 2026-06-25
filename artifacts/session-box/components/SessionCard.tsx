import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Session, SESSION_COLORS } from "@/types/session";
import { useSessions } from "@/context/SessionsContext";

interface Props {
  session: Session;
  onPress: () => void;
}

export function SessionCard({ session, onPress }: Props) {
  const colors = useColors();
  const { deleteSession, renameSession, setSessionLabels } = useSessions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(session.name);
  const [labeling, setLabeling] = useState(false);
  const [labelInput, setLabelInput] = useState((session.labels ?? []).join(", "));
  const accent = SESSION_COLORS[session.colorIndex] ?? colors.primary;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewName(session.name);
    setMenuVisible(true);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Delete Session",
      `Delete "${session.name}"? This will clear all cookies and data.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteSession(session.id) },
      ],
    );
  };

  const handleRename = () => {
    if (newName.trim()) renameSession(session.id, newName.trim());
    setRenaming(false);
  };

  const handleSaveLabels = () => {
    const labels = labelInput
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    setSessionLabels(session.id, labels);
    setLabeling(false);
  };

  const displayUrl = session.lastUrl
    ? session.lastUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "No pages visited yet";

  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.75 },
        ]}
      >
        <View style={[styles.colorBar, { backgroundColor: accent }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconBadge, { backgroundColor: accent + "20" }]}>
              <Feather name="globe" size={14} color={accent} />
            </View>
            <Pressable
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => pressed && { opacity: 0.5 }}
            >
              <Feather name="trash-2" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {session.name}
          </Text>
          {(session.labels ?? []).length > 0 && (
            <View style={styles.labelRow}>
              {(session.labels ?? []).slice(0, 3).map((l, i) => (
                <View key={i} style={[styles.chip, { backgroundColor: accent + "20" }]}>
                  <Text style={[styles.chipText, { color: accent }]} numberOfLines={1}>
                    {l}
                  </Text>
                </View>
              ))}
              {(session.labels ?? []).length > 3 && (
                <Text style={[styles.chipMore, { color: colors.mutedForeground }]}>
                  +{(session.labels ?? []).length - 3}
                </Text>
              )}
            </View>
          )}
          <Text style={[styles.url, { color: colors.mutedForeground }]} numberOfLines={1}>
            {displayUrl}
          </Text>
        </View>
      </Pressable>

      {/* Context Menu */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.menuTitle, { color: colors.foreground }]}>{session.name}</Text>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
              onPress={() => { setMenuVisible(false); setRenaming(true); }}
            >
              <Feather name="edit-2" size={16} color={colors.foreground} />
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>Rename</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
              onPress={() => { setMenuVisible(false); setLabelInput((session.labels ?? []).join(", ")); setLabeling(true); }}
            >
              <Feather name="tag" size={16} color={colors.foreground} />
              <Text style={[styles.menuItemText, { color: colors.foreground }]}>Edit Labels</Text>
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

            <Pressable
              style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={16} color="#ef4444" />
              <Text style={[styles.menuItemText, { color: "#ef4444" }]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Rename Dialog */}
      <Modal visible={renaming} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setRenaming(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.foreground }]}>Rename Session</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleRename}
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.dialogButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setRenaming(false)}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 15, fontWeight: "500" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  styles.dialogBtnPrimary,
                  { backgroundColor: accent },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleRename}
              >
                <Text style={{ color: "#0d1117", fontSize: 15, fontWeight: "700" }}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Labels Dialog */}
      <Modal visible={labeling} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setLabeling(false)}>
          <Pressable style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.foreground }]}>Edit Labels</Text>
            <Text style={[styles.dialogHint, { color: colors.mutedForeground }]}>
              Separate labels with commas (e.g. work, personal, shopping)
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              value={labelInput}
              onChangeText={setLabelInput}
              autoFocus
              selectTextOnFocus
              placeholder="work, personal, shopping"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.dialogButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setLabeling(false)}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 15, fontWeight: "500" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.dialogBtn,
                  styles.dialogBtnPrimary,
                  { backgroundColor: accent },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleSaveLabels}
              >
                <Text style={{ color: "#0d1117", fontSize: 15, fontWeight: "700" }}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    minHeight: 120,
  },
  colorBar: {
    height: 3,
  },
  content: {
    padding: 14,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 10,
    fontWeight: "600",
  },
  chipMore: {
    fontSize: 10,
    fontWeight: "500",
    alignSelf: "center",
  },
  url: {
    fontSize: 11,
    lineHeight: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    gap: 4,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 12,
  },
  dialog: {
    width: 300,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  dialogHint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  dialogButtons: {
    flexDirection: "row",
    gap: 10,
  },
  dialogBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  dialogBtnPrimary: {
    borderWidth: 0,
  },
});
