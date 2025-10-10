import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useState } from "react";

export default function TransferScreen() {
  const { colors, fontConfig } = useTheme();
  const insets = useSafeAreaInsets();
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");

  // ========================================
  // 🎨 CHANGE ANIMATION HERE:
  // ========================================
  const CUSTOM_ANIMATION = {
    from: { opacity: 0, translateX: -100 }, // Slide from left
    animate: { opacity: 1, translateX: 0 },
    duration: 250,
    type: "timing" as const,
  };
  // ========================================

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg[0] }}>
      <LinearGradient colors={colors.bg} style={{ flex: 1 }}>
        <MotiView
          from={CUSTOM_ANIMATION.from}
          animate={CUSTOM_ANIMATION.animate}
          transition={{
            type: CUSTOM_ANIMATION.type,
            duration: CUSTOM_ANIMATION.duration,
          }}
          style={{ flex: 1 }}
        >
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ paddingTop: insets.top + 20, paddingHorizontal: 16, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            
            <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
              Transfer Data
            </Text>

            {/* From Account */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.bold }]}>
                From Account
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.bg[0], borderColor: colors.cardBorder }]}>
                <Ionicons name="person-outline" size={20} color={colors.subtext} />
                <TextInput
                  style={[styles.input, { color: colors.text, fontFamily: fontConfig.regular }]}
                  placeholder="Select source account"
                  placeholderTextColor={colors.subtext}
                  value={fromAccount}
                  onChangeText={setFromAccount}
                />
              </View>
            </View>

            {/* Transfer Icon */}
            <View style={styles.transferIcon}>
              <Ionicons name="arrow-down" size={32} color={colors.accent} />
            </View>

            {/* To Account */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.bold }]}>
                To Account
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.bg[0], borderColor: colors.cardBorder }]}>
                <Ionicons name="person-outline" size={20} color={colors.subtext} />
                <TextInput
                  style={[styles.input, { color: colors.text, fontFamily: fontConfig.regular }]}
                  placeholder="Select destination account"
                  placeholderTextColor={colors.subtext}
                  value={toAccount}
                  onChangeText={setToAccount}
                />
              </View>
            </View>

            {/* Transfer Button */}
            <Pressable
              style={[styles.button, { backgroundColor: colors.accent }]}
              android_ripple={{ color: colors.accent2 }}
            >
              <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
                Start Transfer
              </Text>
            </Pressable>

          </ScrollView>
        </MotiView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    marginBottom: 24,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  transferIcon: {
    alignItems: "center",
    marginVertical: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
