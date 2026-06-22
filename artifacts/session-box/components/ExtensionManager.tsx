import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useExtensions } from "@/context/ExtensionsContext";
import { useToast } from "@/context/ToastContext";
import { Extension, BUILT_IN_EXTENSIONS } from "@/types/extension";

interface Props {
  visible: boolean;
  sessionId: string;
  onClose: () => void;
}

export function ExtensionManager({ visible, sessionId, onClose }: Props) {
  const colors = useColors();
  const { getExtensions, installExtension, uninstallExtension, toggleExtension, addCustomExtension } = useExtensions();
  const { showToast } = useToast();
  const [tab, setTab] = useState<"installed" | "store">("installed");
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customScript, setCustomScript] = useState("");

  const installed = getExtensions(sessionId);

  const handleInstall = (ext: Extension) => {
    installExtension(sessionId, ext);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`"${ext.name}" installed`, "success", "package");
    setTab("installed");
  };

  const handleUninstall = (ext: Extension) => {
    uninstallExtension(sessionId, ext.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showToast(`"${ext.name}" uninstalled`, "info", "trash-2");
  };

  const handleToggle = (ext: Extension) => {
    toggleExtension(sessionId, ext.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast(
      ext.enabled ? `"${ext.name}" disabled` : `"${ext.name}" enabled`,
      ext.enabled ? "warning" : "success",
    );
  };

  const handleAddCustom = () => {
    if (!customName.trim() || !customScript.trim()) return;
    addCustomExtension(sessionId, customName.trim(), customScript.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`"${customName.trim()}" installed`, "success", "code");
    setCustomName("");
    setCustomScript("");
    setShowCustom(false);
    setTab("installed");
  };

  const availableExtensions = BUILT_IN_EXTENSIONS.filter(
    (be) => !installed.some((ie) => ie.id === be.id),
  );

  const renderInstalled = ({ item }: { item: Extension }) => (
    <View style={[styles.extCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.extHeader}>
        <View style={[styles.extIcon, { backgroundColor: item.enabled ? colors.primary + "20" : colors.muted }]}>
          <Feather name={item.icon as any} size={16} color={item.enabled ? colors.primary : colors.mutedForeground} />
        </View>
        <View style={styles.extInfo}>
          <Text style={[styles.extName, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.extDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.description}
          </Text>
        </View>
        <Switch
          value={item.enabled}
          onValueChange={() => handleToggle(item)}
          trackColor={{ false: colors.border, true: colors.primary + "60" }}
          thumbColor={item.enabled ? colors.primary : colors.mutedForeground}
        />
      </View>
      <TouchableOpacity style={styles.uninstallBtn} onPress={() => handleUninstall(item)}>
        <Feather name="trash-2" size={13} color={colors.destructive} />
        <Text style={[styles.uninstallText, { color: colors.destructive }]}>Uninstall</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStore = ({ item }: { item: Extension }) => (
    <View style={[styles.extCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.extHeader}>
        <View style={[styles.extIcon, { backgroundColor: colors.primary + "20" }]}>
          <Feather name={item.icon as any} size={16} color={colors.primary} />
        </View>
        <View style={styles.extInfo}>
          <Text style={[styles.extName, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.extDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.installBtn, { backgroundColor: colors.primary }]}
        onPress={() => handleInstall(item)}
      >
        <Feather name="plus" size={14} color="#0d1117" />
        <Text style={styles.installText}>Install</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Extensions</Text>
            <View style={{ width: 22 }} />
          </View>

          <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tab, tab === "installed" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setTab("installed")}
            >
              <Text style={[styles.tabText, { color: tab === "installed" ? colors.primary : colors.mutedForeground }]}>
                Installed ({installed.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === "store" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setTab("store")}
            >
              <Text style={[styles.tabText, { color: tab === "store" ? colors.primary : colors.mutedForeground }]}>
                Extension Store
              </Text>
            </TouchableOpacity>
          </View>

          {tab === "store" && (
            <TouchableOpacity
              style={[styles.customBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowCustom(true)}
            >
              <Feather name="code" size={16} color={colors.primary} />
              <Text style={[styles.customBtnText, { color: colors.foreground }]}>Add Custom Extension</Text>
            </TouchableOpacity>
          )}

          <FlatList
            data={tab === "installed" ? installed : availableExtensions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name={tab === "installed" ? "package" : "shopping-bag"} size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  {tab === "installed" ? "No extensions installed" : "All extensions installed"}
                </Text>
              </View>
            }
            renderItem={tab === "installed" ? renderInstalled : renderStore}
          />

          <Modal visible={showCustom} transparent animationType="fade">
            <Pressable style={styles.overlay} onPress={() => setShowCustom(false)}>
              <Pressable style={[styles.customDialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.dialogTitle, { color: colors.foreground }]}>Custom Extension</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Extension name"
                  placeholderTextColor={colors.mutedForeground}
                  value={customName}
                  onChangeText={setCustomName}
                  autoFocus
                />
                <TextInput
                  style={[styles.scriptInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Paste your JavaScript code here..."
                  placeholderTextColor={colors.mutedForeground}
                  value={customScript}
                  onChangeText={setCustomScript}
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.dialogButtons}>
                  <TouchableOpacity
                    style={[styles.dialogBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setShowCustom(false)}
                  >
                    <Text style={{ color: colors.mutedForeground, fontSize: 15, fontWeight: "500" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dialogBtn, styles.dialogBtnPrimary, { backgroundColor: colors.primary }]}
                    onPress={handleAddCustom}
                  >
                    <Text style={{ color: "#0d1117", fontSize: 15, fontWeight: "700" }}>Install</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    height: "85%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  customBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    marginBottom: 0,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  customBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  list: {
    padding: 16,
    gap: 10,
  },
  extCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  extHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  extIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  extInfo: {
    flex: 1,
    gap: 2,
  },
  extName: {
    fontSize: 15,
    fontWeight: "600",
  },
  extDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  uninstallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  uninstallText: {
    fontSize: 12,
    fontWeight: "600",
  },
  installBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  installText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0d1117",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  customDialog: {
    width: "90%",
    maxWidth: 380,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    gap: 14,
    alignSelf: "center",
    marginTop: "auto",
    marginBottom: "auto",
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
    paddingVertical: 11,
    fontSize: 15,
  },
  scriptInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    height: 120,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
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
