import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  const { deleteSession, renameSession } = useSessions();
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(session.name);
  const accent = SESSION_COLORS[session.colorIndex] ?? colors.primary;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewName(session.name);
    setRenaming(true);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Delete Session", `Delete "${session.name}"? This will clear all cookies and data.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteSession(session.id),
      },
    ]);
  };

  const handleRename = () => {
    if (newName.trim()) {
      renameSession(session.id, newName.trim());
    }
    setRenaming(false);
  };

  const displayUrl = session.lastUrl
    ? session.lastUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "No pages visited yet";

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.75}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={[styles.colorBar, { backgroundColor: accent }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconBadge, { backgroundColor: accent + "20" }]}>
              <Feather name="globe" size={14} color={accent} />
            </View>
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="trash-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {session.name}
          </Text>
          <Text style={[styles.url, { color: colors.mutedForeground }]} numberOfLines={1}>
            {displayUrl}
          </Text>
        </View>
      </TouchableOpacity>

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
              <TouchableOpacity
                style={[styles.dialogBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setRenaming(false)}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 15, fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, styles.dialogBtnPrimary, { backgroundColor: accent }]}
                onPress={handleRename}
              >
                <Text style={{ color: "#0d1117", fontSize: 15, fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
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
