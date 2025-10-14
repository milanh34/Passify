import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAnimation } from "../../src/context/AnimationContext";
import { Ionicons } from "@expo/vector-icons";

// Toast Component
const Toast = ({ message, visible }: { message: string; visible: boolean }) => {
  const { colors, fontConfig } = useTheme();

  if (!visible) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 50 }}
      transition={{ type: "timing", duration: 300 }}
      style={[
        styles.toast,
        { backgroundColor: colors.accent, borderColor: colors.accent2 },
      ]}
    >
      <Ionicons name="checkmark-circle" size={24} color="#fff" />
      <Text style={[styles.toastText, { fontFamily: fontConfig.regular }]}>
        {message}
      </Text>
    </MotiView>
  );
};

export default function TransferScreen() {
  const { colors, fontConfig } = useTheme();
  const { addPlatform, addAccount, updatePlatformSchema } = useDb();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [animationKey, setAnimationKey] = useState(0);
  const { TAB_ANIMATION } = useAnimation();

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey((prev) => prev + 1);
    }, [])
  );

  // Parse the transfer text format
  const parseTransferText = (text: string) => {
    const platforms = text.trim().split("\n\n\n");
    const result: Record<string, any[]> = {};

    for (const platformBlock of platforms) {
      if (!platformBlock.trim()) continue;

      const parts = platformBlock.split("\n\n");
      if (parts.length < 2) continue;

      const platformName = parts[0].trim();
      const accounts: any[] = [];

      for (let i = 1; i < parts.length; i++) {
        const accountBlock = parts[i];
        if (!accountBlock.trim()) continue;

        const lines = accountBlock.trim().split("\n");
        const accountData: Record<string, string> = {};

        for (const line of lines) {
          if (line.includes(" - ")) {
            const [key, value] = line.split(" - ", 2);
            const fieldName = key.trim().toLowerCase().replace(/\s+/g, "_");
            accountData[fieldName] = value.trim();
          }
        }

        if (Object.keys(accountData).length > 0) {
          accounts.push(accountData);
        }
      }

      if (accounts.length > 0) {
        result[platformName] = accounts;
      }
    }

    return result;
  };

  // Handle the import process
  const handleImport = async () => {
    if (!inputText.trim()) {
      Alert.alert("Empty Input", "Please paste some text to import.");
      return;
    }

    setIsProcessing(true);

    try {
      const parsedData = parseTransferText(inputText);
      const platformNames = Object.keys(parsedData);

      if (platformNames.length === 0) {
        Alert.alert(
          "Parse Error",
          "Could not parse the text. Please check the format."
        );
        setIsProcessing(false);
        return;
      }

      let totalAccounts = 0;

      for (const platformName of platformNames) {
        const accounts = parsedData[platformName];

        // Add platform first
        const platformId = platformName.toLowerCase().replace(/\s+/g, "_");
        await addPlatform(platformId, platformName);

        // Extract all unique fields from all accounts
        const allFields = new Set<string>();
        accounts.forEach((acc) => {
          Object.keys(acc).forEach((field) => allFields.add(field));
        });

        // Ensure 'name' and 'password' are always included
        const schema = Array.from(allFields);
        if (!schema.includes("name")) schema.unshift("name");
        if (!schema.includes("password")) {
          const nameIndex = schema.indexOf("name");
          schema.splice(nameIndex + 1, 0, "password");
        }

        // Update schema for this platform
        await updatePlatformSchema(platformId, schema);

        // Add each account
        for (let i = 0; i < accounts.length; i++) {
          const accountData = accounts[i];
          
          // Generate a name if not provided
          if (!accountData.name) {
            accountData.name = `Account ${i + 1}`;
          }
          
          // Ensure password field exists
          if (!accountData.password) {
            accountData.password = "";
          }

          await addAccount(platformId, accountData);
          totalAccounts++;
        }
      }

      // Show success message
      setToastMessage(
        `Imported ${totalAccounts} accounts from ${platformNames.length} platform(s)`
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);

      // Clear input
      setInputText("");

      // Navigate to Manage screen after 2 seconds
      setTimeout(() => {
        router.push("/(tabs)");
      }, 2000);
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert("Import Failed", "An error occurred while importing data.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear input
  const handleClear = () => {
    setInputText("");
  };

  return (
    <LinearGradient colors={colors.bg} style={styles.root}>
      <MotiView
        key={animationKey}
        from={TAB_ANIMATION.from}
        animate={TAB_ANIMATION.animate}
        transition={{
          type: TAB_ANIMATION.type,
          duration: TAB_ANIMATION.duration,
        }}
        style={[styles.container, { paddingTop: insets.top + 20 }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="cloud-upload" size={40} color={colors.accent} />
            <Text
              style={[
                styles.title,
                { color: colors.text, fontFamily: fontConfig.bold },
              ]}
            >
              Import Data
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.subtext, fontFamily: fontConfig.regular },
              ]}
            >
              Paste your formatted text below to import platforms and accounts
            </Text>
          </View>

          {/* Instructions */}
          <View
            style={[
              styles.instructionsCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.accent + "30",
              },
            ]}
          >
            <Text
              style={[
                styles.instructionsTitle,
                { color: colors.accent2, fontFamily: fontConfig.bold },
              ]}
            >
              Format Guide
            </Text>
            <Text
              style={[
                styles.instructionsText,
                { color: colors.subtext, fontFamily: fontConfig.regular },
              ]}
            >
              • Platform name on first line{"\n"}
              • Two blank lines after platform name{"\n"}
              • Field lines: "Key - Value"{"\n"}
              • Two blank lines between accounts{"\n"}
              • Three blank lines between platforms
            </Text>
          </View>

          {/* Text Input */}
          <View
            style={[
              styles.inputCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.accent + "40",
              },
            ]}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Paste your data here..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={12}
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  fontFamily: fontConfig.regular,
                },
              ]}
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleClear}
              style={[
                styles.button,
                styles.clearButton,
                { backgroundColor: colors.card, borderColor: colors.accent },
              ]}
            >
              <Ionicons name="trash-outline" size={20} color={colors.accent} />
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.accent, fontFamily: fontConfig.bold },
                ]}
              >
                Clear
              </Text>
            </Pressable>

            <Pressable
              onPress={handleImport}
              disabled={isProcessing}
              style={[
                styles.button,
                styles.importButton,
                { backgroundColor: colors.accent },
                isProcessing && { opacity: 0.6 },
              ]}
            >
              <Ionicons
                name={isProcessing ? "hourglass-outline" : "download-outline"}
                size={20}
                color="#fff"
              />
              <Text
                style={[
                  styles.buttonText,
                  { color: "#fff", fontFamily: fontConfig.bold },
                ]}
              >
                {isProcessing ? "Importing..." : "Import"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </MotiView>

      {/* Toast Notification */}
      <Toast message={toastMessage} visible={showToast} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 40 },
  header: {
    alignItems: "center",
    marginVertical: 20,
    gap: 8,
  },
  title: {
    fontSize: 28,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  instructionsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 13,
    lineHeight: 22,
  },
  inputCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    minHeight: 250,
  },
  textInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 220,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: {
    borderWidth: 1,
  },
  importButton: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
  },
  toast: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
  },
});
