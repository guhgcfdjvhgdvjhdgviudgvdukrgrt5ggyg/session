import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useSessions } from "@/context/SessionsContext";
import { SessionCard } from "@/components/SessionCard";
import { EmptyState } from "@/components/EmptyState";

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessions } = useSessions();
  const [query, setQuery] = useState("");
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const allLabels = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => (s.labels ?? []).forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [sessions]);

  const results = useMemo(() => {
    let filtered = sessions;
    if (activeLabel) {
      filtered = filtered.filter((s) => (s.labels ?? []).includes(activeLabel));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.lastUrl.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.labels ?? []).some((l) => l.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [query, sessions, activeLabel]);

  const handleLabelPress = (label: string) => {
    setActiveLabel(activeLabel === label ? null : label);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search sessions..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.cancel, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {allLabels.length > 0 && (
        <View style={[styles.labelBar, { borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {allLabels.map((label) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: activeLabel === label ? colors.primary + "20" : colors.card,
                    borderColor: activeLabel === label ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleLabelPress(label)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: activeLabel === label ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.list,
          results.length === 0 && { flex: 1 },
          { paddingBottom: insets.bottom + 24 },
        ]}
        ListEmptyComponent={
          query.trim() || activeLabel ? (
            <View style={styles.empty}>
              <Feather name="search" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No sessions found</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Try a different search term or label
              </Text>
            </View>
          ) : (
            <EmptyState />
          )
        }
        scrollEnabled={results.length > 0}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() => router.push(`/browser/${item.id}`)}
          />
        )}
      />
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
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  searchRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cancel: {
    fontSize: 15,
    fontWeight: "600",
  },
  labelBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  list: {
    padding: 10,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
  },
});
