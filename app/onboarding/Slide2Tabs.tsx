// app/onboarding/Slide2Tabs.tsx

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import OnboardingSlide from "../../src/components/OnboardingSlide";
import { Ionicons } from "@expo/vector-icons";


export default function Slide2Tabs() {
  const { colors, fontConfig } = useTheme();


  return (
    <OnboardingSlide slideIndex={1}>
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            { color: colors.text, fontFamily: fontConfig.bold },
          ]}
        >
          Explore the Four Tabs
        </Text>


        <Text
          style={[
            styles.subtitle,
            { color: colors.subtext, fontFamily: fontConfig.regular },
          ]}
        >
          Each tab has a specific purpose:
        </Text>


        <TabCard
          icon="grid"
          title="Manage"
          description="Add, edit, delete, and organize your accounts. Search and sort your credentials by platform or creation date."
          color={colors.accent}
          colors={colors}
          fontConfig={fontConfig}
        />


        <TabCard
          icon="swap-horizontal"
          title="Transfer"
          description="Import account data from external sources into the app. Export your credentials to text format for backup or migration."
          color={colors.accent}
          colors={colors}
          fontConfig={fontConfig}
        />
      </View>
    </OnboardingSlide>
  );
}


function TabCard({
  icon,
  title,
  description,
  color,
  colors,
  fontConfig,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  colors: any;
  fontConfig: any;
}) {
  return (
    <View
      style={[styles.card, { backgroundColor: `${color}10`, borderColor: color }]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconBox, { backgroundColor: `${color}20` }]}
        >
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <Text
          style={[
            styles.cardTitle,
            { color: colors.text, fontFamily: fontConfig.bold },
          ]}
        >
          {title}
        </Text>
      </View>
      <Text
        style={[
          styles.cardDescription,
          { color: colors.subtext, fontFamily: fontConfig.regular },
        ]}
      >
        {description}
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
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
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
});
