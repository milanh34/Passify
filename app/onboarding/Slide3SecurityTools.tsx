// app/onboarding/Slide3SecurityTools.tsx - VERSION 2 (Professional)

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import Animated, { useAnimatedStyle, useSharedValue, interpolate } from "react-native-reanimated";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

const securityFeatures = [
  {
    icon: "key",
    title: "Smart Password Generator",
    points: [
      "Customizable 8-64 character length",
      "Include symbols, numbers, uppercase",
      "Passphrase mode for memorability",
      "Real-time strength indicator",
    ],
  },
  {
    icon: "link",
    title: "Connected Accounts Discovery",
    points: [
      "Auto-detect shared emails",
      "View linked platforms at a glance",
      "Navigate between related accounts",
      "Security audit visibility",
    ],
  },
  {
    icon: "finger-print",
    title: "Biometric & PIN Authentication",
    points: [
      "Face ID / Touch ID support",
      "Secure PIN backup option",
      "Progressive lockout protection",
      "Configurable auto-lock timer",
    ],
  },
  {
    icon: "image",
    title: "Encrypted Image Backups",
    points: [
      "AES-256-CTR encryption",
      "Hidden in plain PNG images",
      "Password-protected recovery",
      "Safe for cloud storage",
    ],
  },
];

export default function Slide3SecurityTools() {
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
          <View
            style={[
              styles.headerBadge,
              {
                backgroundColor: theme.colors.accentMuted,
                borderRadius: theme.shapes.radiusSm,
              },
            ]}
          >
            <Ionicons name="shield-checkmark" size={16} color={theme.colors.accent} />
            <Text
              style={{
                color: theme.colors.accent,
                fontFamily: theme.typography.fontBold,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Security First
            </Text>
          </View>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontBold,
              },
            ]}
          >
            Enterprise-Grade Protection
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
            Your credentials are protected with industry-leading security standards
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
            {securityFeatures.map((feature, index) => (
              <MotiView
                key={feature.title}
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "timing",
                  duration: 400,
                  delay: 150 + index * 100,
                }}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.surfaceBorder,
                    borderRadius: theme.shapes.radiusLg,
                  },
                ]}
              >
                <View style={styles.featureHeader}>
                  <View
                    style={[
                      styles.featureIcon,
                      {
                        backgroundColor: theme.colors.accentMuted,
                        borderRadius: theme.shapes.radiusMd,
                      },
                    ]}
                  >
                    <Ionicons name={feature.icon as any} size={24} color={theme.colors.accent} />
                  </View>
                  <Text
                    style={{
                      color: theme.colors.textPrimary,
                      fontFamily: theme.typography.fontBold,
                      fontSize: theme.typography.sizeMd + 1,
                      flex: 1,
                    }}
                  >
                    {feature.title}
                  </Text>
                </View>
                <View style={styles.pointsList}>
                  {feature.points.map((point, pointIndex) => (
                    <View key={pointIndex} style={styles.pointItem}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent} />
                      <Text
                        style={{
                          color: theme.colors.textSecondary,
                          fontFamily: theme.typography.fontRegular,
                          fontSize: theme.typography.sizeSm + 1,
                          flex: 1,
                        }}
                      >
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              </MotiView>
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
    alignItems: "center",
    marginBottom: 24,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
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
  featureCard: {
    padding: 16,
    borderWidth: 1,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pointsList: {
    gap: 8,
  },
  pointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
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
