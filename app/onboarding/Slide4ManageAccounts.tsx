// app/onboarding/Slide4ManageAccounts.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import Animated, { useAnimatedStyle, useSharedValue, interpolate } from "react-native-reanimated";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

const features = [
  {
    icon: "add-circle",
    title: "Add Accounts",
    description:
      "Use the + button to add individual accounts, or use the Transfer tab to import accounts in bulk from external sources.",
  },
  {
    icon: "create",
    title: "Edit Accounts",
    description:
      "Tap any account card to expand it, then tap the edit icon to modify usernames, passwords, or platform details.",
  },
  {
    icon: "trash",
    title: "Delete Accounts",
    description:
      "Remove accounts you no longer need. Expand a card and tap the delete icon to remove it permanently.",
  },
  {
    icon: "search",
    title: "Search Accounts",
    description:
      "Quickly find any account using the search bar. Search by platform name, username, or any keyword.",
  },
  {
    icon: "funnel",
    title: "Sort & Filter",
    description:
      "Organize your accounts by date added, platform name, alphabetically, or custom sorting preferences.",
  },
  {
    icon: "shield-checkmark",
    title: "Encrypt Data",
    description:
      "Encrypt your entire credential database into a secure image format using your master password.",
  },
  {
    icon: "key",
    title: "Decrypt Data",
    description:
      "Decrypt your encrypted image back to access all your credentials using your master password.",
  },
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
      <View style={[styles.container, { paddingHorizontal: theme.spacing.xl }]}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: theme.animations.durationNormal }}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
                fontSize: theme.typography.sizeXxl + 4,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            Managing Your Accounts
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.typography.fontRegular,
                fontSize: theme.typography.sizeMd,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            Complete control over your credentials:
          </Text>
        </MotiView>

        <View style={styles.scrollContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, { gap: theme.spacing.md }]}
            style={styles.scrollView}
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
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                theme={theme}
                index={index}
              />
            ))}
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

function FeatureItem({
  icon,
  title,
  description,
  theme,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  theme: ReturnType<typeof useAppTheme>;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{
        type: "timing",
        duration: theme.animations.durationNormal,
        delay: index * theme.animations.listItemStagger,
      }}
      style={[
        styles.featureCard,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.shapes.radiusMd,
          borderWidth: theme.shapes.borderThin,
          borderColor: theme.colors.surfaceBorder,
          padding: theme.spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: theme.colors.accentMuted,
            borderRadius: theme.shapes.radiusMd,
          },
        ]}
      >
        <Ionicons name={icon as any} size={24} color={theme.colors.accent} />
      </View>
      <View style={styles.featureContent}>
        <Text
          style={[
            styles.featureTitle,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeMd + 1,
            },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.featureDescription,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.typography.fontRegular,
              fontSize: theme.typography.sizeSm + 1,
              lineHeight: 19,
            },
          ]}
        >
          {description}
        </Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {},
  subtitle: {},
  scrollContainer: {
    flex: 1,
    flexDirection: "row",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingRight: 8,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  featureContent: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {},
  featureDescription: {},
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
