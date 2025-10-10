import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { useTheme } from "../../src/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useState } from "react";

export default function DecoderScreen() {
  const { colors, fontConfig } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  // ========================================
  // 🎨 CHANGE ANIMATION HERE:
  // ========================================
  const CUSTOM_ANIMATION = {
    from: { opacity: 0, translateY: 30 }, // Slide from bottom
    animate: { opacity: 1, translateY: 0 },
    duration: 250,
    type: "timing" as const,
  };
  // ========================================

  const handleDecode = () => {
    try {
      const decoded = Buffer.from(inputText, "base64").toString("utf-8");
      setOutputText(decoded);
    } catch (error) {
      setOutputText("Invalid encoded text");
    }
  };

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
              Decode Data
            </Text>

            {/* Input */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.bold }]}>
                Encoded Text
              </Text>
              <TextInput
                style={[styles.textArea, { color: colors.text, fontFamily: fontConfig.regular, backgroundColor: colors.bg[0], borderColor: colors.cardBorder }]}
                placeholder="Paste encoded text here..."
                placeholderTextColor={colors.subtext}
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={6}
              />
            </View>

            {/* Decode Button */}
            <Pressable
              style={[styles.button, { backgroundColor: colors.accent }]}
              onPress={handleDecode}
              android_ripple={{ color: colors.accent2 }}
            >
              <Ionicons name="key" size={20} color="#fff" />
              <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
                Decode
              </Text>
            </Pressable>

            {/* Output */}
            {outputText ? (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.bold }]}>
                  Decoded Output
                </Text>
                <View style={[styles.outputBox, { backgroundColor: colors.bg[0], borderColor: colors.cardBorder }]}>
                  <Text style={[styles.outputText, { color: colors.text, fontFamily: fontConfig.regular }]}>
                    {outputText}
                  </Text>
                </View>
              </View>
            ) : null}

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
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 120,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  outputBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  outputText: {
    fontSize: 14,
  },
});
