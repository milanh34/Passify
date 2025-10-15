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
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useDb } from "../../context/DbContext";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { parseTransferText } from "../../utils/transferParser";
import Toast from "../Toast";

export default function ImportTab() {
  const { colors, fontConfig } = useTheme();
  const { addPlatform, addAccount, updatePlatformSchema } = useDb();
  const router = useRouter();

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);

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

        const platformId = platformName.toLowerCase().replace(/\s+/g, "_");
        await addPlatform(platformId, platformName);

        const allFields = new Set<string>();
        accounts.forEach((acc) => {
          Object.keys(acc).forEach((field) => allFields.add(field));
        });

        const schema = Array.from(allFields);
        if (!schema.includes("name")) schema.unshift("name");
        if (!schema.includes("password")) {
          const nameIndex = schema.indexOf("name");
          schema.splice(nameIndex + 1, 0, "password");
        }

        await updatePlatformSchema(platformId, schema);

        for (let i = 0; i < accounts.length; i++) {
          const accountData = accounts[i];

          if (!accountData.name) {
            accountData.name = `Account ${i + 1}`;
          }

          if (!accountData.password) {
            accountData.password = "";
          }

          await addAccount(platformId, accountData);
          totalAccounts++;
        }
      }

      setToastMessage(
        `Imported ${totalAccounts} accounts from ${platformNames.length} platform(s)`
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);

      setInputText("");

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

  const handleClear = () => {
    setInputText("");
  };

  return (
    <>
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

        {/* Expandable Guide */}
        <Pressable
          onPress={() => setIsGuideExpanded(!isGuideExpanded)}
          style={[
            styles.guideCard,
            {
              backgroundColor: colors.card,
              borderColor: isGuideExpanded
                ? colors.accent
                : colors.accent + "30",
            },
          ]}
        >
          <View style={styles.guideHeader}>
            <Text
              style={[
                styles.guideTitle,
                { color: colors.accent2, fontFamily: fontConfig.bold },
              ]}
            >
              Format Guide
            </Text>
            <Ionicons
              name={isGuideExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={colors.accent}
            />
          </View>

          <AnimatePresence>
            {isGuideExpanded && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "timing", duration: 200 }}
              >
                <View style={styles.guideContent}>
                  <Text
                    style={[
                      styles.guideText,
                      { color: colors.subtext, fontFamily: fontConfig.regular },
                    ]}
                  >
                    • Platform name on first line{"\n"}
                    • Two blank lines after platform name{"\n"}
                    • Field lines: "Key - Value"{"\n"}
                    • Two blank lines between accounts{"\n"}
                    • Three blank lines between platforms
                  </Text>

                  <View
                    style={[
                      styles.exampleBox,
                      {
                        backgroundColor: colors.bg[0] + "40",
                        borderColor: colors.accent + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.exampleTitle,
                        { color: colors.accent, fontFamily: fontConfig.bold },
                      ]}
                    >
                      Example:
                    </Text>
                    <Text
                      style={[
                        styles.exampleText,
                        { color: colors.text, fontFamily: fontConfig.regular },
                      ]}
                    >
                      Google{"\n\n"}Email - user@gmail.com{"\n"}Password -
                      pass123{"\n\n"}Email - user2@gmail.com{"\n"}Password -
                      pass456{"\n\n\n"}Instagram{"\n\n"}Username - myhandle
                      {"\n"}Password - instapass
                    </Text>
                  </View>
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </Pressable>

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

      <Toast message={toastMessage} visible={showToast} />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: "center", marginVertical: 20, gap: 8 },
  title: { fontSize: 28, marginTop: 8 },
  subtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 20 },
  guideCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  guideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guideTitle: { fontSize: 16 },
  guideContent: { marginTop: 16 },
  guideText: { fontSize: 13, lineHeight: 22, marginBottom: 16 },
  exampleBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  exampleTitle: { fontSize: 14, marginBottom: 8 },
  exampleText: { fontSize: 12, lineHeight: 18 },
  inputCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    minHeight: 250,
  },
  textInput: { fontSize: 14, lineHeight: 20, minHeight: 220 },
  buttonRow: { flexDirection: "row", gap: 12 },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButton: { borderWidth: 1 },
  importButton: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: { fontSize: 16 },
});
