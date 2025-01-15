// app/connected-accounts.tsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter, useNavigation, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { useDb } from "../src/context/DbContext";
import { useAuth } from "../src/context/AuthContext";
import { useInactivityTracker } from "../src/utils/inactivityTracker";
import PlatformIcon from "../src/components/PlatformIcon";
import {
  findConnectedAccounts,
  ConnectedAccountsResult,
  ConnectedPlatform,
  toTitleCase,
} from "../src/utils/connectedAccounts";

export default function ConnectedAccountsScreen() {
  const { email, sourcePlatform, sourceAccountId, sourceAccountName } = useLocalSearchParams<{
    email: string;
    sourcePlatform: string;
    sourceAccountId: string;
    sourceAccountName: string;
  }>();

  const router = useRouter();
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, fontConfig } = useTheme();
  const { database, platformsMetadata } = useDb();

  const { isAuthEnabled } = useAuth();
  const { updateActivity } = useInactivityTracker(isAuthEnabled);

  const [refreshing, setRefreshing] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(
    new Set([sourcePlatform || ""])
  );

  const connectedData: ConnectedAccountsResult = useMemo(() => {
    if (!email) {
      return {
        identifier: "",
        identifierType: "Email",
        totalPlatforms: 0,
        totalAccounts: 0,
        platforms: [],
      };
    }

    return findConnectedAccounts(
      database,
      platformsMetadata,
      email,
      sourcePlatform,
      sourceAccountId
    );
  }, [database, platformsMetadata, email, sourcePlatform, sourceAccountId]);

  useEffect(() => {
    if (isAuthEnabled) {
      updateActivity();
    }
  }, [isAuthEnabled, updateActivity]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const togglePlatformExpand = (platformKey: string) => {
    setExpandedPlatforms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(platformKey)) {
        newSet.delete(platformKey);
      } else {
        newSet.add(platformKey);
      }
      return newSet;
    });
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleNavigateToPlatform = (
    platformKey: string,
    platformName: string,
    accountId?: string
  ) => {
    if (isAuthEnabled) {
      updateActivity();
    }
    router.push({
      pathname: "/accounts",
      params: {
        platform: platformName,
        key: platformKey,
        highlightAccountId: accountId || "",
        fromConnectedAccounts: "true",
      },
    });
  };

  const renderPlatformCard = ({ item, index }: { item: ConnectedPlatform; index: number }) => {
    const isSourcePlatform = item.platformKey === sourcePlatform;
    const isExpanded = expandedPlatforms.has(item.platformKey);

    return (
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: 300,
          delay: index * 80,
        }}
      >
        <View
          style={[
            styles.platformCard,
            {
              backgroundColor: colors.card,
              borderColor: isSourcePlatform ? colors.accent : colors.cardBorder,
              borderWidth: isSourcePlatform ? 2 : 1,
            },
          ]}
        >
          <Pressable
            onPress={() => togglePlatformExpand(item.platformKey)}
            style={styles.platformHeader}
            android_ripple={{ color: colors.accent + "22" }}
          >
            <View style={styles.platformHeaderLeft}>
              <PlatformIcon
                platformName={item.platformName}
                iconKey={item.icon}
                iconColor={item.iconColor}
                size={48}
              />
              <View style={styles.platformInfo}>
                <View style={styles.platformNameRow}>
                  <Text
                    style={[
                      styles.platformName,
                      { color: colors.text, fontFamily: fontConfig.bold },
                    ]}
                    numberOfLines={1}
                  >
                    {toTitleCase(item.platformName)}
                  </Text>
                  {isSourcePlatform && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.currentBadgeText, { fontFamily: fontConfig.bold }]}>
                        Source
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.accountCount,
                    { color: colors.subtext, fontFamily: fontConfig.regular },
                  ]}
                >
                  {item.accountCount} account{item.accountCount !== 1 ? "s" : ""} using this email
                </Text>
              </View>
            </View>

            <View style={styles.platformHeaderRight}>
              {!isSourcePlatform && (
                <Pressable
                  onPress={() => {
                    const firstAccountId = item.accounts[0]?.accountId;
                    handleNavigateToPlatform(item.platformKey, item.platformName, firstAccountId);
                  }}
                  style={[
                    styles.goButton,
                    {
                      backgroundColor: colors.accent + "15",
                      borderColor: colors.accent + "30",
                    },
                  ]}
                  android_ripple={{ color: colors.accent + "33" }}
                >
                  <Text
                    style={[
                      styles.goButtonText,
                      { color: colors.accent, fontFamily: fontConfig.bold },
                    ]}
                  >
                    View
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.accent} />
                </Pressable>
              )}
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={22}
                color={colors.muted}
              />
            </View>
          </Pressable>

          <AnimatePresence>
            {isExpanded && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "timing", duration: 200 }}
              >
                <View style={[styles.accountsList, { borderTopColor: colors.cardBorder }]}>
                  {item.accounts.map((account, accIndex) => {
                    const isSourceAccount =
                      isSourcePlatform && account.accountId === sourceAccountId;

                    return (
                      <MotiView
                        key={account.accountId}
                        from={{ opacity: 0, translateX: -10 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{
                          type: "timing",
                          duration: 150,
                          delay: accIndex * 50,
                        }}
                      >
                        <Pressable
                          onPress={() => {
                            if (!isSourcePlatform) {
                              handleNavigateToPlatform(
                                item.platformKey,
                                item.platformName,
                                account.accountId
                              );
                            }
                          }}
                          style={[
                            styles.accountItem,
                            {
                              backgroundColor: isSourceAccount
                                ? colors.accent + "15"
                                : colors.bg[0],
                              borderColor: isSourceAccount
                                ? colors.accent + "40"
                                : colors.cardBorder,
                            },
                          ]}
                          android_ripple={
                            !isSourcePlatform ? { color: colors.accent + "22" } : undefined
                          }
                        >
                          <Ionicons
                            name="person-circle"
                            size={24}
                            color={isSourceAccount ? colors.accent : colors.muted}
                          />
                          <View style={styles.accountInfo}>
                            <Text
                              style={[
                                styles.accountName,
                                {
                                  color: isSourceAccount ? colors.accent : colors.text,
                                  fontFamily: isSourceAccount
                                    ? fontConfig.bold
                                    : fontConfig.regular,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {account.accountName}
                            </Text>
                            <Text
                              style={[
                                styles.accountField,
                                { color: colors.muted, fontFamily: fontConfig.regular },
                              ]}
                            >
                              via {account.matchingField}
                            </Text>
                          </View>
                          {isSourceAccount && (
                            <View
                              style={[styles.sourceIndicator, { backgroundColor: colors.accent }]}
                            >
                              <Ionicons name="checkmark" size={12} color="#fff" />
                            </View>
                          )}
                        </Pressable>
                      </MotiView>
                    );
                  })}
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      </MotiView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg[0] }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            router.back();
            if (isAuthEnabled) {
              updateActivity();
            }
          }}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
          android_ripple={{ color: colors.accent + "22" }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fontConfig.bold }]}>
            Connected Platforms
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: colors.subtext, fontFamily: fontConfig.regular },
            ]}
            numberOfLines={1}
          >
            From: {sourceAccountName || "Account"}
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.emailBadgeContainer}>
        <View
          style={[
            styles.emailBadge,
            {
              backgroundColor: colors.accent + "15",
              borderColor: colors.accent + "30",
            },
          ]}
        >
          <Ionicons name="mail" size={20} color={colors.accent} />
          <Text
            style={[styles.emailText, { color: colors.accent, fontFamily: fontConfig.bold }]}
            numberOfLines={1}
          >
            {email}
          </Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.summaryItem}>
            <Ionicons name="layers" size={24} color={colors.accent} />
            <Text
              style={[styles.summaryNumber, { color: colors.text, fontFamily: fontConfig.bold }]}
            >
              {connectedData.totalPlatforms}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                { color: colors.subtext, fontFamily: fontConfig.regular },
              ]}
            >
              Platform{connectedData.totalPlatforms !== 1 ? "s" : ""}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.summaryItem}>
            <Ionicons name="people" size={24} color={colors.accent} />
            <Text
              style={[styles.summaryNumber, { color: colors.text, fontFamily: fontConfig.bold }]}
            >
              {connectedData.totalAccounts}
            </Text>
            <Text
              style={[
                styles.summaryLabel,
                { color: colors.subtext, fontFamily: fontConfig.regular },
              ]}
            >
              Account{connectedData.totalAccounts !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={connectedData.platforms}
        keyExtractor={(item) => item.platformKey}
        renderItem={renderPlatformCard}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={64} color={colors.muted} />
            <Text
              style={[styles.emptyText, { color: colors.subtext, fontFamily: fontConfig.regular }]}
            >
              No connected platforms found for this email.
            </Text>
          </View>
        }
      />

      {connectedData.totalPlatforms > 1 && (
        <View
          style={[
            styles.securityTip,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.cardBorder,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
          <Text
            style={[
              styles.securityTipText,
              { color: colors.subtext, fontFamily: fontConfig.regular },
            ]}
          >
            Tip: Use unique passwords for each platform to improve security.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  emailBadgeContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  emailText: {
    fontSize: 16,
    flex: 1,
  },
  summary: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  summaryNumber: {
    fontSize: 28,
  },
  summaryLabel: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  platformCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  platformHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  platformHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  platformInfo: {
    flex: 1,
  },
  platformNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  platformName: {
    fontSize: 17,
    flex: 1,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  currentBadgeText: {
    fontSize: 10,
    color: "#fff",
  },
  accountCount: {
    fontSize: 13,
    marginTop: 4,
  },
  platformHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  goButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  goButtonText: {
    fontSize: 13,
  },
  accountsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
  },
  accountField: {
    fontSize: 11,
    marginTop: 2,
  },
  sourceIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  securityTip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  securityTipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
