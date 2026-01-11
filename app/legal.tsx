// app/legal.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import {
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
  OPEN_SOURCE_LICENSES,
} from "../src/constants/legalContent";

type LegalType = "privacy" | "terms" | "licenses";

interface Section {
  type: "heading" | "subheading" | "paragraph" | "bullet" | "bold";
  content: string;
  level?: number;
}

function parseMarkdown(markdown: string): Section[] {
  const lines = markdown.trim().split("\n");
  const sections: Section[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (trimmed.startsWith("# ")) {
      sections.push({ type: "heading", content: trimmed.slice(2), level: 1 });
    } else if (trimmed.startsWith("## ")) {
      sections.push({ type: "subheading", content: trimmed.slice(3), level: 2 });
    } else if (trimmed.startsWith("### ")) {
      sections.push({ type: "subheading", content: trimmed.slice(4), level: 3 });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      sections.push({ type: "bullet", content: trimmed.slice(2) });
    } else if (/^\d+\.\s/.test(trimmed)) {
      sections.push({ type: "bullet", content: trimmed.replace(/^\d+\.\s/, "") });
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      sections.push({ type: "bold", content: trimmed.slice(2, -2) });
    } else {
      sections.push({ type: "paragraph", content: trimmed });
    }
  }

  return sections;
}

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: LegalType }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fontConfig } = useTheme();

  const [content, setContent] = useState<Section[]>([]);
  const [title, setTitle] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    switch (type) {
      case "privacy":
        setContent(parseMarkdown(PRIVACY_POLICY.content));
        setTitle("Privacy Policy");
        setLastUpdated(PRIVACY_POLICY.lastUpdated);
        break;
      case "terms":
        setContent(parseMarkdown(TERMS_OF_SERVICE.content));
        setTitle("Terms of Service");
        setLastUpdated(TERMS_OF_SERVICE.lastUpdated);
        break;
      case "licenses":
        setContent(parseMarkdown(OPEN_SOURCE_LICENSES.content));
        setTitle("Open Source Licenses");
        setLastUpdated(OPEN_SOURCE_LICENSES.lastUpdated);
        break;
      default:
        setContent([]);
        setTitle("Legal");
    }
  }, [type]);

  const renderSection = (section: Section, index: number) => {
    switch (section.type) {
      case "heading":
        return (
          <Text
            key={index}
            style={[
              styles.heading,
              {
                color: colors.text,
                fontFamily: fontConfig.bold,
              },
            ]}
          >
            {section.content}
          </Text>
        );

      case "subheading":
        return (
          <Text
            key={index}
            style={[
              styles.subheading,
              {
                color: colors.text,
                fontFamily: fontConfig.bold,
                fontSize: section.level === 3 ? 16 : 18,
              },
            ]}
          >
            {section.content}
          </Text>
        );

      case "bullet":
        return (
          <View key={index} style={styles.bulletContainer}>
            <Text style={[styles.bulletPoint, { color: colors.accent }]}>•</Text>
            <Text
              style={[
                styles.bulletText,
                {
                  color: colors.text,
                  fontFamily: fontConfig.regular,
                },
              ]}
            >
              {section.content.replace(/\*\*/g, "")}
            </Text>
          </View>
        );

      case "bold":
        return (
          <Text
            key={index}
            style={[
              styles.boldText,
              {
                color: colors.accent,
                fontFamily: fontConfig.bold,
              },
            ]}
          >
            {section.content}
          </Text>
        );

      case "paragraph":
      default:
        const text = section.content
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/❌|✅|⚠️/g, (match) => match + " ");

        return (
          <Text
            key={index}
            style={[
              styles.paragraph,
              {
                color: colors.subtext,
                fontFamily: fontConfig.regular,
              },
            ]}
          >
            {text}
          </Text>
        );
    }
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
          onPress={() => router.back()}
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

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: fontConfig.bold,
            },
          ]}
        >
          {title}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.updatedBadge,
            {
              backgroundColor: colors.accent + "15",
              borderColor: colors.accent + "30",
            },
          ]}
        >
          <Ionicons name="time-outline" size={14} color={colors.accent} />
          <Text
            style={[
              styles.updatedText,
              {
                color: colors.accent,
                fontFamily: fontConfig.regular,
              },
            ]}
          >
            Last updated: {lastUpdated}
          </Text>
        </View>

        {content.map((section, index) => renderSection(section, index))}

        <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
          <Text
            style={[
              styles.footerText,
              {
                color: colors.muted,
                fontFamily: fontConfig.regular,
              },
            ]}
          >
            Passify - Your Privacy-First Password Manager
          </Text>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  updatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  updatedText: {
    fontSize: 12,
  },
  heading: {
    fontSize: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  subheading: {
    fontSize: 18,
    marginBottom: 12,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  boldText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
});
