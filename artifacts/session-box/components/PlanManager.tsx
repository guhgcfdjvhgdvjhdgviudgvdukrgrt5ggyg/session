import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { usePlan } from "@/context/PlanContext";
import { useToast } from "@/context/ToastContext";
import { PLANS, PlanTier } from "@/types/plan";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TIER_COLORS: Record<string, string> = {
  basic: "#22c55e",
  pro: "#3b82f6",
  plus: "#a855f7",
  unlimited: "#f59e0b",
};

export function PlanManager({ visible, onClose }: Props) {
  const colors = useColors();
  const {
    plan, deviceKey, deviceId, upgrade, isAdmin, setAdmin,
    requestUpgrade, parseRequestToken, fulfillRequest,
    generateAdminKey, adminKeys, clearAdminKeys, tierList,
  } = usePlan();
  const { showToast } = useToast();
  const [activationKey, setActivationKey] = useState("");
  const [requestTier, setRequestTier] = useState<PlanTier | null>(null);
  const [showRequestPicker, setShowRequestPicker] = useState(false);
  const [requestToken, setRequestToken] = useState<string | null>(null);
  const [adminGenTier, setAdminGenTier] = useState<PlanTier>("basic");
  const [showAdminPicker, setShowAdminPicker] = useState(false);
  const [fulfillToken, setFulfillToken] = useState("");
  const [fulfillResult, setFulfillResult] = useState<string | null>(null);

  const handleUpgrade = () => {
    if (!activationKey.trim()) return;
    const success = upgrade(activationKey.trim());
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Plan upgraded successfully!", "success", "zap");
      setActivationKey("");
      onClose();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Invalid activation key", "error", "x-circle");
    }
  };

  const handleRequest = () => {
    if (!requestTier) return;
    const token = requestUpgrade(requestTier);
    if (token) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRequestToken(token);
    }
  };

  const handleFulfill = () => {
    if (!fulfillToken.trim()) return;
    const parsed = parseRequestToken(fulfillToken.trim());
    if (!parsed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast("Invalid request token", "error", "x-circle");
      return;
    }
    const key = fulfillRequest(fulfillToken.trim());
    if (key) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFulfillResult(key);
      showToast(`Activation key generated for ${PLANS[parsed.tier].name}`, "success", "zap");
    }
  };

  const handleCopy = (text: string, label: string) => {
    showToast(`${label} copied`, "success", "copy");
  };

  const tierColor = plan.tier === "free"
    ? colors.mutedForeground
    : TIER_COLORS[plan.tier] || colors.primary;

  const adminTapCount = () => {
    setAdmin(!isAdmin);
    showToast(isAdmin ? "Admin mode off" : "Admin mode on", "info", "shield");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
            <View style={{ width: 22 }} />
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
            {/* DEVICE SECTION */}
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>DEVICE</Text>
              <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="smartphone" size={16} color={colors.mutedForeground} />
                <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Device ID</Text>
                <Text style={[styles.rowValue, { color: colors.foreground }]} selectable numberOfLines={1}>
                  {deviceId.slice(0, 16)}...
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCopy(deviceKey, "Device key")}
                onLongPress={adminTapCount}
                delayLongPress={30000}
                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Feather name="key" size={16} color={colors.primary} />
                <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>Device Key</Text>
                <Text style={[styles.rowValue, styles.mono, { color: colors.primary }]} selectable numberOfLines={1}>
                  {deviceKey}
                </Text>
              </TouchableOpacity>
              {isAdmin && (
                <View style={[styles.adminBadge, { backgroundColor: "#f59e0b20", borderColor: "#f59e0b40" }]}>
                  <Feather name="shield" size={14} color="#f59e0b" />
                  <Text style={[styles.adminBadgeText, { color: "#f59e0b" }]}>Admin Mode Active</Text>
                </View>
              )}
            </View>

            {/* PLAN SECTION */}
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PLAN</Text>
              <View style={[styles.planBadge, { backgroundColor: tierColor + "20", borderColor: tierColor + "40" }]}>
                <Feather name="zap" size={18} color={tierColor} />
                <Text style={[styles.planBadgeText, { color: tierColor }]}>{plan.name}</Text>
              </View>

              <View style={styles.limits}>
                {Object.values(PLANS).map((p) => (
                  <View
                    key={p.tier}
                    style={[
                      styles.limitCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: plan.tier === p.tier ? tierColor : colors.border,
                        opacity: plan.tier === p.tier ? 1 : 0.4,
                      },
                    ]}
                  >
                    <Text style={[styles.limitName, { color: colors.foreground }]}>{p.name}</Text>
                    <View style={styles.limitRow}>
                      <Feather name="layers" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.limitText, { color: colors.mutedForeground }]}>
                        {p.maxSessions} sessions
                      </Text>
                    </View>
                    <View style={styles.limitRow}>
                      <Feather name="package" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.limitText, { color: colors.mutedForeground }]}>
                        {p.maxExtensionsPerSession} extensions
                      </Text>
                    </View>
                    {p.customExtensions && (
                      <View style={styles.limitRow}>
                        <Feather name="code" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.limitText, { color: colors.mutedForeground }]}>Custom scripts</Text>
                      </View>
                    )}
                    {plan.tier === p.tier && (
                      <View style={[styles.currentBadge, { backgroundColor: tierColor }]}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* REQUEST UPGRADE (user side) */}
            {plan.tier !== "unlimited" && !requestToken && (
              <View style={[styles.section, { borderBottomColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>REQUEST UPGRADE</Text>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Select a plan and generate a request token. Share it with the admin to get an activation key.
                </Text>
                {!showRequestPicker ? (
                  <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: colors.border }]}
                    onPress={() => setShowRequestPicker(true)}
                  >
                    <Feather name="send" size={16} color={colors.foreground} />
                    <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>
                      Request Upgrade
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.pickerContainer}>
                    {tierList.filter((t) => t !== "free" && t !== plan.tier).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.tierOption,
                          {
                            backgroundColor: colors.card,
                            borderColor: requestTier === t ? TIER_COLORS[t] || colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setRequestTier(t)}
                      >
                        <Text style={[styles.tierOptionName, { color: colors.foreground }]}>{PLANS[t].name}</Text>
                        <Text style={[styles.tierOptionDetail, { color: colors.mutedForeground }]}>
                          {PLANS[t].maxSessions} sessions · {PLANS[t].maxExtensionsPerSession} extensions
                        </Text>
                        {requestTier === t && (
                          <Feather name="check-circle" size={18} color={TIER_COLORS[t] || colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                    <View style={styles.pickerActions}>
                      <TouchableOpacity
                        style={[styles.pickerCancel, { borderColor: colors.border }]}
                        onPress={() => { setShowRequestPicker(false); setRequestTier(null); }}
                      >
                        <Text style={{ color: colors.mutedForeground, fontSize: 14, fontWeight: "500" }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.pickerConfirm, {
                          backgroundColor: colors.primary,
                          opacity: requestTier ? 1 : 0.5,
                        }]}
                        onPress={handleRequest}
                        disabled={!requestTier}
                      >
                        <Text style={styles.pickerConfirmText}>Generate Token</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* REQUEST TOKEN (shown after generation) */}
            {requestToken && (
              <View style={[styles.section, { borderBottomColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>YOUR REQUEST TOKEN</Text>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Share this token with the admin. They will generate an activation key for you.
                </Text>
                <TouchableOpacity
                  style={[styles.tokenBox, { backgroundColor: colors.card, borderColor: colors.primary + "40" }]}
                  onPress={() => handleCopy(requestToken, "Request token")}
                >
                  <Text style={[styles.mono, { color: colors.primary, fontSize: 13 }]}>{requestToken}</Text>
                  <Feather name="copy" size={14} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.outlineBtn, { borderColor: colors.border }]}
                  onPress={() => { setRequestToken(null); setShowRequestPicker(false); setRequestTier(null); }}
                >
                  <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>Make Another Request</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ACTIVATION KEY (user pastes admin's key here) */}
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACTIVATION KEY</Text>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                Have an activation key from the admin? Paste it below to upgrade instantly.
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Paste activation key (e.g. sbx-a1b2c3-pro)"
                placeholderTextColor={colors.mutedForeground}
                value={activationKey}
                onChangeText={setActivationKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.upgradeBtn, { backgroundColor: colors.primary, opacity: activationKey.trim() ? 1 : 0.5 }]}
                onPress={handleUpgrade}
                disabled={!activationKey.trim()}
              >
                <Feather name="zap" size={16} color="#0d1117" />
                <Text style={styles.upgradeBtnText}>Activate</Text>
              </TouchableOpacity>
            </View>

            {/* ADMIN PANEL */}
            {isAdmin && (
              <View style={styles.section}>
                <View style={[styles.adminHeader, { borderBottomColor: colors.border }]}>
                  <Feather name="shield" size={16} color="#f59e0b" />
                  <Text style={[styles.sectionTitle, { color: "#f59e0b" }]}>ADMIN PANEL</Text>
                </View>

                {/* Fulfill Request Token */}
                <Text style={[styles.adminSubtitle, { color: colors.mutedForeground }]}>Fulfill Request Token</Text>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Paste a user's request token to generate an activation key for their chosen plan.
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Paste request token (e.g. req-xxx-basic-xxxx)"
                  placeholderTextColor={colors.mutedForeground}
                  value={fulfillToken}
                  onChangeText={(v) => { setFulfillToken(v); setFulfillResult(null); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {fulfillToken.trim() && !fulfillResult && (
                  <TouchableOpacity
                    style={[styles.upgradeBtn, { backgroundColor: "#f59e0b" }]}
                    onPress={handleFulfill}
                  >
                    <Feather name="check" size={16} color="#0d1117" />
                    <Text style={styles.upgradeBtnText}>Approve & Generate Key</Text>
                  </TouchableOpacity>
                )}
                {fulfillResult && (
                  <View>
                    <TouchableOpacity
                      style={[styles.tokenBox, { backgroundColor: colors.card, borderColor: "#22c55e40" }]}
                      onPress={() => handleCopy(fulfillResult, "Activation key")}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.mono, { color: "#22c55e", fontSize: 13 }]}>{fulfillResult}</Text>
                        <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 4 }}>
                          Tap to copy — send this to the user
                        </Text>
                      </View>
                      <Feather name="copy" size={14} color="#22c55e" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.outlineBtn, { borderColor: colors.border, marginTop: 8 }]}
                      onPress={() => { setFulfillToken(""); setFulfillResult(null); }}
                    >
                      <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>Fulfill Another</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Key Generator */}
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.adminSubtitle, { color: colors.mutedForeground }]}>Generate Key (Manual)</Text>
                  {!showAdminPicker ? (
                    <TouchableOpacity
                      style={[styles.outlineBtn, { borderColor: colors.border }]}
                      onPress={() => setShowAdminPicker(true)}
                    >
                      <Feather name="key" size={16} color={colors.foreground} />
                      <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>Generate Key</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.pickerContainer}>
                      {tierList.filter((t) => t !== "free").map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[
                            styles.tierOption,
                            {
                              backgroundColor: colors.card,
                              borderColor: adminGenTier === t ? TIER_COLORS[t] || colors.primary : colors.border,
                            },
                          ]}
                          onPress={() => setAdminGenTier(t)}
                        >
                          <Text style={[styles.tierOptionName, { color: colors.foreground }]}>{PLANS[t].name}</Text>
                          <Text style={[styles.tierOptionDetail, { color: colors.mutedForeground }]}>
                            {PLANS[t].maxSessions} sessions · {PLANS[t].maxExtensionsPerSession} extensions
                          </Text>
                          {adminGenTier === t && (
                            <Feather name="check-circle" size={18} color={TIER_COLORS[t] || colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[styles.generateBtn, { backgroundColor: "#f59e0b" }]}
                        onPress={() => {
                          const key = generateAdminKey(adminGenTier);
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          showToast(`Key generated: ${key}`, "success", "key");
                        }}
                      >
                        <Feather name="zap" size={16} color="#0d1117" />
                        <Text style={styles.generateBtnText}>Generate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setShowAdminPicker(false)}>
                        <Text style={{ color: colors.mutedForeground, fontSize: 13, textAlign: "center" }}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {adminKeys.length > 0 && (
                  <View style={styles.generatedKeys}>
                    <View style={styles.gkHeader}>
                      <Text style={[styles.gkTitle, { color: colors.mutedForeground }]}>Generated Keys</Text>
                      <TouchableOpacity onPress={clearAdminKeys}>
                        <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "600" }}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                    {adminKeys.map((k, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[styles.gkItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => handleCopy(k, "Key")}
                      >
                        <Text style={[styles.mono, { color: colors.foreground, fontSize: 12 }]}>{k}</Text>
                        <Feather name="copy" size={12} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
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
    height: "92%",
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
  body: {
    flex: 1,
    padding: 20,
  },
  section: {
    gap: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 160,
  },
  mono: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  planBadgeText: {
    fontSize: 16,
    fontWeight: "700",
  },
  limits: {
    gap: 10,
    marginTop: 4,
  },
  limitCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 6,
    position: "relative",
  },
  limitName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  limitText: {
    fontSize: 13,
  },
  currentBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0d1117",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  upgradeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0d1117",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pickerContainer: {
    gap: 8,
  },
  tierOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tierOptionName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  tierOptionDetail: {
    fontSize: 12,
    marginRight: 8,
  },
  pickerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  pickerCancel: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  pickerConfirm: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  pickerConfirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0d1117",
  },
  tokenBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  adminSubtitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  generateBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0d1117",
  },
  generatedKeys: {
    gap: 6,
    marginTop: 12,
  },
  gkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gkTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  gkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
