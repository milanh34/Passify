// app/onboarding/Slide1Welcome.tsx
import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import OnboardingSlide from "../../src/components/OnboardingSlide";
import { Ionicons } from "@expo/vector-icons";

export default function Slide1Welcome() {
  const { colors, fontConfig } = useTheme();

  return (
    <OnboardingSlide slideIndex={0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.container}>
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.title,
              { color: colors.text, fontFamily: fontConfig.bold },
            ]}
          >
            Welcome to Passify
          </Text>

          <Text
            style={[
              styles.description,
              { color: colors.subtext, fontFamily: fontConfig.regular },
            ]}
          >
            Your secure and organized password manager. Store encrypted credentials
            across multiple platforms with powerful search and sorting capabilities.
          </Text>

          {/* Key Features Preview */}
          <View style={styles.featuresGrid}>
            <FeatureItem
              icon="lock-closed"
              label="Encrypted"
              color={colors.accent}
            />
            <FeatureItem
              icon="search"
              label="Searchable"
              color={colors.accent}
            />
            <FeatureItem
              icon="funnel"
              label="Sortable"
              color={colors.accent}
            />
            <FeatureItem
              icon="layers"
              label="Multi-Platform"
              color={colors.accent}
            />
          </View>

          <Text
            style={[
              styles.securityNote,
              { color: colors.accent, fontFamily: fontConfig.regular },
            ]}
          >
            All your data is encrypted and stored securely on your device
          </Text>
        </View>
      </ScrollView>
    </OnboardingSlide>
  );
}

function FeatureItem({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: string;
}) {
  const { colors, fontConfig } = useTheme();
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text
        style={[
          styles.featureLabel,
          { color: colors.text, fontFamily: fontConfig.regular },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  appIcon: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    marginTop: 16,
    gap: 16,
  },
  featureItem: {
    alignItems: "center",
    gap: 6,
    width: "42%",
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  securityNote: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});
