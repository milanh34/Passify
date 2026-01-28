// app/onboarding/Slide4ManageAccounts.tsx - VERSION 2 (Professional)

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import Animated, { useAnimatedStyle, useSharedValue, interpolate } from "react-native-reanimated";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

const capabilities = [
  { icon: "add-circle", label: "Add", desc: "Create accounts with custom fields" },
  { icon: "create", label: "Edit", desc: "Update credentials anytime" },
  { icon: "trash", label: "Delete", desc: "Remove or bulk delete" },
  { icon: "search", label: "Search", desc: "Find anything instantly" },
  { icon: "funnel", label: "Sort", desc: "Organize your way" },
  { icon: "link", label: "Connect", desc: "View related accounts" },
];

const formats = [
  { icon: "calendar", title: "Date Formats", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
  { icon: "call", title: "Phone Formats", options: ["Plain", "Dashed", "Parentheses"] },
];

export default function Slide4ManageAccounts() {
  const theme = useAppTheme();
  const [completeScrollBarHeight, setCompleteScrollBarHeight] = useState(1);
  const [visibleScrollBarHeight, setVisibleScrollBarHeight] = useState(0);
  const scrollIndicator = useSharedValue(0);

  const scrollIndicatorSize =
    completeScrollBarHeight > visibleScrollBarHeight
      ? (visibleScrollBarHeight * visibleScrollBarHeight) / completeScrollBarHeight
      : visibleScrollBarHeight;

  const difference =
    visibleScrollBarHeight > scrollIndicatorSize ? visibleScrollBarHeight - scrollIndicatorSize : 1;

  const scrollIndicatorPosition = useAnimatedStyle(() => {
    const position = interpolate(
      scrollIndicator.value,
      [0, completeScrollBarHeight - visibleScrollBarHeight],
      [0, difference]
    );

    return {
      transform: [{ translateY: position }],
    };
  });

  const handleScroll = (event: any) => {
    scrollIndicator.value = event.nativeEvent.contentOffset.y;
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 300 }}
          style={styles.header}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
              },
            ]}
          >
            Powerful Vault Management
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontRegular,
              },
            ]}
          >
            Everything you need to manage your digital identity
          </Text>
        </MotiView>

        <View style={styles.scrollContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onContentSizeChange={(_, height) => {
              setCompleteScrollBarHeight(height);
            }}
            onLayout={({
              nativeEvent: {
                layout: { height },
              },
            }) => {
              setVisibleScrollBarHeight(height);
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 300, delay: 150 }}
              style={[
                styles.capabilitiesCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.shapes.radiusLg,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeMd + 1,
                  marginBottom: 16,
                }}
              >
                Core Capabilities
              </Text>
              <View style={styles.capabilitiesGrid}>
                {capabilities.map((cap, index) => (
                  <MotiView
                    key={cap.label}
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{
                      type: "timing",
                      duration: 200,
                      delay: 250 + index * 50,
                    }}
                    style={[
                      styles.capabilityItem,
                      {
                        backgroundColor: theme.colors.background,
                        borderRadius: theme.shapes.radiusMd,
                      },
                    ]}
                  >
                    <Ionicons name={cap.icon as any} size={22} color={theme.colors.accent} />
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontBold,
                        fontSize: theme.typography.sizeSm,
                        marginTop: 6,
                      }}
                    >
                      {cap.label}
                    </Text>
                    <Text
                      style={{
                        color: theme.colors.textMuted,
                        fontFamily: theme.typography.fontRegular,
                        fontSize: 10,
                        textAlign: "center",
                        marginTop: 2,
                      }}
                    >
                      {cap.desc}
                    </Text>
                  </MotiView>
                ))}
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: 500 }}
              style={[
                styles.formatsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.shapes.radiusLg,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeMd + 1,
                  marginBottom: 16,
                }}
              >
                Display Customization
              </Text>
              {formats.map((format, index) => (
                <View
                  key={format.title}
                  style={[
                    styles.formatRow,
                    index < formats.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.surfaceBorder,
                      paddingBottom: 14,
                      marginBottom: 14,
                    },
                  ]}
                >
                  <View style={styles.formatHeader}>
                    <Ionicons name={format.icon as any} size={18} color={theme.colors.accent} />
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontBold,
                        fontSize: theme.typography.sizeSm + 1,
                      }}
                    >
                      {format.title}
                    </Text>
                  </View>
                  <View style={styles.formatOptions}>
                    {format.options.map((option) => (
                      <View
                        key={option}
                        style={[
                          styles.formatBadge,
                          {
                            backgroundColor: theme.colors.accentMuted,
                            borderRadius: theme.shapes.radiusSm,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: theme.colors.accent,
                            fontFamily: theme.typography.fontRegular,
                            fontSize: 11,
                          }}
                        >
                          {option}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 300, delay: 600 }}
              style={[
                styles.platformsCard,
                {
                  backgroundColor: theme.colors.accentMuted,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
            >
              <View style={styles.platformsContent}>
                <Ionicons name="layers" size={28} color={theme.colors.accent} />
                <View style={styles.platformsText}>
                  <Text
                    style={{
                      color: theme.colors.textPrimary,
                      fontFamily: theme.typography.fontBold,
                      fontSize: theme.typography.sizeMd,
                    }}
                  >
                    200+ Platform Icons
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.textSecondary,
                      fontFamily: theme.typography.fontRegular,
                      fontSize: theme.typography.sizeSm,
                      marginTop: 2,
                    }}
                  >
                    Auto-detected for Google, GitHub, Discord, and more
                  </Text>
                </View>
              </View>
            </MotiView>
          </ScrollView>

          <View style={styles.scrollBarContainer}>
            <View
              style={[
                styles.scrollBarTrack,
                {
                  backgroundColor: theme.colors.accentMuted,
                  borderRadius: theme.shapes.radiusSm,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.scrollBarThumb,
                  {
                    backgroundColor: theme.colors.accent,
                    height: scrollIndicatorSize,
                    borderRadius: theme.shapes.radiusSm,
                  },
                  scrollIndicatorPosition,
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  scrollContainer: {
    flex: 1,
    flexDirection: "row",
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 8,
    paddingRight: 8,
  },
  capabilitiesCard: {
    padding: 16,
    borderWidth: 1,
  },
  capabilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  capabilityItem: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  formatsCard: {
    padding: 16,
    borderWidth: 1,
  },
  formatRow: {},
  formatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  formatOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  formatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  platformsCard: {
    padding: 16,
  },
  platformsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  platformsText: {
    flex: 1,
  },
  scrollBarContainer: {
    width: 6,
    marginLeft: 8,
    justifyContent: "center",
  },
  scrollBarTrack: {
    width: 6,
    height: "100%",
  },
  scrollBarThumb: {
    width: 6,
  },
});
