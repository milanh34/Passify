// app/onboarding/Slide3SecurityTools.tsx

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";

export default function Slide3SecurityTools() {
  const theme = useAppTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
              Security & Encoding Tools
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeMd,
                  marginBottom: theme.spacing.xl,
                },
              ]}
            >
              Advanced features for data security:
            </Text>
          </MotiView>

          <ToolCard
            icon="lock-closed"
            title="Encoder"
            description="Converts your data into encrypted text, then transforms it into a secure image format for maximum protection."
            accentColor="#FF9800"
            theme={theme}
            delay={150}
          />

          <ToolCard
            icon="key"
            title="Decoder"
            description="Decodes the encrypted image using your password. The decrypted data can then be imported directly into the app."
            accentColor="#2196F3"
            theme={theme}
            delay={300}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ToolCard({
  icon,
  title,
  description,
  accentColor,
  theme,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  theme: ReturnType<typeof useAppTheme>;
  delay: number;
}) {
  const color = theme.isOriginalTheme ? accentColor : theme.colors.accent;

  return (
    <MotiView
      from={{ opacity: 0, translateX: 30 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: theme.animations.durationNormal, delay }}
      style={[
        styles.card,
        {
          backgroundColor: color + "15",
          borderColor: color,
          borderWidth: theme.shapes.borderThin,
          borderRadius: theme.components.card.radius,
          padding: theme.components.card.padding,
          marginBottom: theme.spacing.lg,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: color + "30",
              borderRadius: theme.shapes.radiusMd,
            },
          ]}
        >
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <Text
          style={[
            styles.cardTitle,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontBold,
              fontSize: theme.typography.sizeXl,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      <Text
        style={[
          styles.cardDescription,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontRegular,
            fontSize: theme.typography.sizeSm + 1,
            lineHeight: 20,
          },
        ]}
      >
        {description}
      </Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  title: {},
  subtitle: {},
  card: {
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {},
  cardDescription: {},
});
