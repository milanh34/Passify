// app/onboarding/Slide4ManageAccounts.tsx

import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import OnboardingSlide from "../../src/components/OnboardingSlide";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";


export default function Slide4ManageAccounts() {
  const { colors, fontConfig } = useTheme();
  const [completeScrollBarHeight, setCompleteScrollBarHeight] = useState(1);
  const [visibleScrollBarHeight, setVisibleScrollBarHeight] = useState(0);
  const scrollIndicator = useSharedValue(0);


  const features = [
    {
      icon: "add-circle",
      title: "Add Accounts",
      description: "Use the + button to add individual accounts, or use the Transfer tab to import accounts in bulk from external sources.",
    },
    {
      icon: "create",
      title: "Edit Accounts",
      description: "Tap any account card to expand it, then tap the edit icon to modify usernames, passwords, or platform details.",
    },
    {
      icon: "trash",
      title: "Delete Accounts",
      description: "Remove accounts you no longer need. Expand a card and tap the delete icon to remove it permanently.",
    },
    {
      icon: "search",
      title: "Search Accounts",
      description: "Quickly find any account using the search bar. Search by platform name, username, or any keyword.",
    },
    {
      icon: "funnel",
      title: "Sort & Filter",
      description: "Organize your accounts by date added, platform name, alphabetically, or custom sorting preferences.",
    },
    {
      icon: "shield-checkmark",
      title: "Encrypt Data",
      description: "Encrypt your entire credential database into a secure image format using your master password.",
    },
    {
      icon: "key",
      title: "Decrypt Data",
      description: "Decrypt your encrypted image back to access all your credentials using your master password.",
    },
  ];


  const scrollIndicatorSize =
    completeScrollBarHeight > visibleScrollBarHeight
      ? (visibleScrollBarHeight * visibleScrollBarHeight) / completeScrollBarHeight
      : visibleScrollBarHeight;


  const difference =
    visibleScrollBarHeight > scrollIndicatorSize
      ? visibleScrollBarHeight - scrollIndicatorSize
      : 1;


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
    <OnboardingSlide slideIndex={3}>
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            { color: colors.text, fontFamily: fontConfig.bold },
          ]}
        >
          Managing Your Accounts
        </Text>


        <Text
          style={[
            styles.subtitle,
            { color: colors.subtext, fontFamily: fontConfig.regular },
          ]}
        >
          Complete control over your credentials:
        </Text>


        <View style={styles.scrollContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
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
                color={colors.accent}
                colors={colors}
                fontConfig={fontConfig}
              />
            ))}
          </ScrollView>


          <View style={styles.scrollBarContainer}>
            <View
              style={[
                styles.scrollBarTrack,
                { backgroundColor: `${colors.accent}20` },
              ]}
            >
              <Animated.View
                style={[
                  styles.scrollBarThumb,
                  {
                    backgroundColor: colors.accent,
                    height: scrollIndicatorSize,
                  },
                  scrollIndicatorPosition,
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </OnboardingSlide>
  );
}


function FeatureItem({
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
    <View style={styles.featureCard}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.featureContent}>
        <Text
          style={[
            styles.featureTitle,
            { color: colors.text, fontFamily: fontConfig.bold },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.featureDescription,
            { color: colors.subtext, fontFamily: fontConfig.regular },
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
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
  scrollContainer: {
    flex: 1,
    flexDirection: "row",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 20,
    paddingRight: 8,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureContent: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  scrollBarContainer: {
    width: 6,
    marginLeft: 8,
    justifyContent: "center",
  },
  scrollBarTrack: {
    width: 6,
    height: "100%",
    borderRadius: 3,
  },
  scrollBarThumb: {
    width: 6,
    borderRadius: 3,
  },
});
