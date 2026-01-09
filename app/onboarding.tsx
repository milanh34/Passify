// app/onboarding.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../src/context/ThemeContext";
import { saveOnboardingState } from "../src/utils/onboardingState";
import ConfirmModal from "../src/components/ConfirmModal";

import Slide1Welcome from "./onboarding/Slide1Welcome";
import Slide2Tabs from "./onboarding/Slide2Tabs";
import Slide3SecurityTools from "./onboarding/Slide3SecurityTools";
import Slide4ManageAccounts from "./onboarding/Slide4ManageAccounts";
import Slide5Tips from "./onboarding/Slide5Tips";
import Slide6GetStarted from "./onboarding/Slide6GetStarted";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  Slide1Welcome,
  Slide2Tabs,
  Slide3SecurityTools,
  Slide4ManageAccounts,
  Slide5Tips,
  Slide6GetStarted,
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fontConfig } = useTheme();

  const translateX = useSharedValue(0);
  const isTransitioning = useSharedValue(false);

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      animateToSlide(currentSlide + 1, "next");
    }
  };

  const handlePrevious = () => {
    if (!isFirstSlide) {
      animateToSlide(currentSlide - 1, "prev");
    }
  };

  const animateToSlide = (newIndex: number, direction: "next" | "prev") => {
    if (isTransitioning.value) return;

    isTransitioning.value = true;
    const targetX = direction === "next" ? -SCREEN_WIDTH : SCREEN_WIDTH;

    translateX.value = withTiming(targetX, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setCurrentSlide)(newIndex);
        translateX.value = direction === "next" ? SCREEN_WIDTH : -SCREEN_WIDTH;
        translateX.value = withTiming(0, { duration: 300 }, () => {
          isTransitioning.value = false;
        });
      }
    });
  };

  const handleSkipAll = () => {
    setShowSkipModal(true);
  };

  const handleComplete = async () => {
    try {
      await saveOnboardingState({
        onboardingComplete: true,
        onboardingCompletedDate: Date.now(),
        onboardingVersion: 1,
      });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
      router.replace("/(tabs)");
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      if (!isTransitioning.value && Math.abs(event.translationX) > Math.abs(event.translationY)) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (isTransitioning.value) return;

      const SWIPE_THRESHOLD = 50;
      const velocity = event.velocityX;

      if ((event.translationX < -SWIPE_THRESHOLD || velocity < -500) && !isLastSlide) {
        runOnJS(handleNext)();
      } else if ((event.translationX > SWIPE_THRESHOLD || velocity > 500) && !isFirstSlide) {
        runOnJS(handlePrevious)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const CurrentSlideComponent = SLIDES[currentSlide];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg[0] }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            backgroundColor: colors.bg[0],
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <Text
          style={[styles.slideCounter, { color: colors.subtext, fontFamily: fontConfig.regular }]}
        >
          {currentSlide + 1} / {SLIDES.length}
        </Text>

        {!isLastSlide && (
          <Pressable
            onPress={handleSkipAll}
            style={({ pressed }) => [
              styles.skipButton,
              {
                backgroundColor: pressed ? `${colors.accent}20` : `${colors.accent}10`,
              },
            ]}
          >
            <Text
              style={[styles.skipButtonText, { color: colors.accent, fontFamily: fontConfig.bold }]}
            >
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.slideContainer, animatedStyle]}>
          <CurrentSlideComponent key={`slide-${currentSlide}`} />
        </Animated.View>
      </GestureDetector>

      <View style={[styles.dotContainer, { backgroundColor: colors.bg[0] }]}>
        {SLIDES.map((_, index) => (
          <MotiView
            key={index}
            animate={{
              width: index === currentSlide ? 24 : 8,
              backgroundColor: index === currentSlide ? colors.accent : `${colors.accent}30`,
            }}
            transition={{
              type: "timing",
              duration: 300,
            }}
            style={styles.dot}
          />
        ))}
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 20, backgroundColor: colors.bg[0] },
        ]}
      >
        <Pressable
          onPress={handlePrevious}
          disabled={isFirstSlide}
          style={({ pressed }) => [
            styles.navButton,
            styles.previousButton,
            {
              backgroundColor: isFirstSlide
                ? colors.card
                : pressed
                  ? `${colors.accent}20`
                  : colors.card,
              borderColor: colors.cardBorder,
              opacity: isFirstSlide ? 0.5 : 1,
            },
          ]}
        >
          <Ionicons name="arrow-back" size={20} color={isFirstSlide ? colors.muted : colors.text} />
          <Text
            style={[
              styles.navButtonText,
              {
                color: isFirstSlide ? colors.muted : colors.text,
                fontFamily: fontConfig.bold,
              },
            ]}
            numberOfLines={1}
          >
            Back
          </Text>
        </Pressable>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.navButton,
            styles.nextButton,
            {
              backgroundColor: pressed ? `${colors.accent}CC` : colors.accent,
            },
          ]}
        >
          <Text
            style={[styles.navButtonText, { color: "#FFFFFF", fontFamily: fontConfig.bold }]}
            numberOfLines={1}
          >
            {isLastSlide ? "Let's Go!" : "Next"}
          </Text>
          <Ionicons name={isLastSlide ? "rocket" : "arrow-forward"} size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <ConfirmModal
        visible={showSkipModal}
        title="Skip Tutorial?"
        message="You can always replay this from Settings > Tutorial & Help whenever you want!"
        confirmText="Skip"
        cancelText="Continue"
        type="warning"
        onConfirm={() => {
          setShowSkipModal(false);
          handleComplete();
        }}
        onCancel={() => setShowSkipModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  slideCounter: {
    fontSize: 14,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipButtonText: {
    fontSize: 14,
  },
  slideContainer: {
    flex: 1,
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    minHeight: 52,
  },
  previousButton: {
    flex: 1,
    borderWidth: 1,
  },
  nextButton: {
    flex: 2,
  },
  navButtonText: {
    fontSize: 16,
  },
});
