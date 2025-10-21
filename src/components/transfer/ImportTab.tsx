import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useDb } from "../../context/DbContext";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { parseTransferText, toTitleCase } from "../../utils/transferParser";
import Toast from "../Toast";
import ConflictModal from "./ConflictModal";

type ConflictResolution = "update" | "skip";

interface ConflictDecision {
  platformId: string;
  accountId: string;
  action: ConflictResolution;
  newData: any;
}

export default function ImportTab() {
  const { colors, fontConfig } = useTheme();
  const { database, addPlatform, addAccount, updateAccount, updatePlatformSchema } = useDb();
  const router = useRouter();

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Conflict resolution state
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<{
    platformName: string;
    existingAccount: any;
    newAccount: any;
    identifierField: string;
  } | null>(null);
  
  // Use ref for immediate synchronous access
  const globalResolutionRef = useRef<ConflictResolution | null>(null);
  const resolutionCallbackRef = useRef<((action: ConflictResolution) => void) | null>(null);

  // Helper to show toast
  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Extract email/username from account data
  const getIdentifierField = (account: any): { field: string; value: string } | null => {
    if (account.email) return { field: "email", value: account.email };
    if (account.gmail) return { field: "gmail", value: account.gmail };
    if (account.username) return { field: "username", value: account.username };
    return null;
  };

  // Extract name from email
  const getNameFromEmail = (account: any): string => {
    const identifier = getIdentifierField(account);
    if (!identifier) return "";

    const email = identifier.value;
    const atIndex = email.indexOf("@");
    if (atIndex > 0) {
      return email.substring(0, atIndex);
    }
    return email;
  };

  // Check if account exists
  const findExistingAccount = (
    platformId: string,
    newAccount: any
  ): { account: any; field: string } | null => {
    const accounts = database[platformId] || [];
    const identifier = getIdentifierField(newAccount);

    if (!identifier) return null;

    const existing = accounts.find((acc: any) => {
      const existingIdentifier = getIdentifierField(acc);
      return (
        existingIdentifier &&
        existingIdentifier.field === identifier.field &&
        existingIdentifier.value.toLowerCase() === identifier.value.toLowerCase()
      );
    });

    return existing ? { account: existing, field: identifier.field } : null;
  };

  // Show conflict modal and wait for resolution
  const askUserForResolution = (
    platformName: string,
    existingAccount: any,
    newAccount: any,
    identifierField: string
  ): Promise<ConflictResolution> => {
    return new Promise((resolve) => {
      setCurrentConflict({
        platformName,
        existingAccount,
        newAccount,
        identifierField,
      });
      setConflictModalVisible(true);
      
      // Store the resolve function in the ref
      resolutionCallbackRef.current = (action: ConflictResolution) => {
        resolve(action);
        resolutionCallbackRef.current = null;
      };
    });
  };

  // Handle user's decision in modal
  const handleDecision = (action: ConflictResolution, applyToAll: boolean) => {
    // Set global resolution in ref for immediate access
    if (applyToAll) {
      globalResolutionRef.current = action;
    }
    
    // Close modal
    setConflictModalVisible(false);
    
    // Call the resolution callback
    if (resolutionCallbackRef.current) {
      resolutionCallbackRef.current(action);
    }
  };

  const handleImport = async () => {
    if (!inputText.trim()) {
      showToastMessage("Please paste some text to import", "error");
      return;
    }

    setIsProcessing(true);
    globalResolutionRef.current = null; // Reset global resolution

    try {
      const parsedData = parseTransferText(inputText);
      const platformNames = Object.keys(parsedData);

      if (platformNames.length === 0) {
        showToastMessage("Could not parse the text. Please check the format", "error");
        setIsProcessing(false);
        return;
      }

      // Phase 1: Collect all operations and resolve conflicts
      const newAccountsToAdd: Array<{ platformId: string; data: any }> = [];
      const decisionsToApply: ConflictDecision[] = [];

      for (const platformName of platformNames) {
        const accounts = parsedData[platformName];
        const titleCaseName = toTitleCase(platformName);
        const platformId = platformName.toLowerCase().replace(/\s+/g, "_");

        // Check if platform exists
        const platformExists = !!database[platformId];

        if (!platformExists) {
          // Create new platform
          await addPlatform(platformId);
        }

        // Extract all unique fields from all accounts
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

        // Update schema for this platform
        await updatePlatformSchema(platformId, schema);

        // Process each account
        for (let i = 0; i < accounts.length; i++) {
          const accountData = { ...accounts[i] };

          // Generate name from email if not provided
          if (!accountData.name) {
            const emailName = getNameFromEmail(accountData);
            accountData.name = emailName || `Account ${i + 1}`;
          }

          // Ensure password field exists
          if (!accountData.password) {
            accountData.password = "";
          }

          // Store the title case platform name in each account
          accountData.platform = titleCaseName;

          // Check for existing account
          const existingData = findExistingAccount(platformId, accountData);

          if (existingData) {
            // Conflict detected - decide what to do
            let action: ConflictResolution;

            // Check ref for immediate value
            if (globalResolutionRef.current) {
              // Use global resolution if set
              action = globalResolutionRef.current;
            } else {
              // Ask user for this specific conflict
              action = await askUserForResolution(
                titleCaseName,
                existingData.account,
                accountData,
                existingData.field
              );
            }

            // Store the decision
            decisionsToApply.push({
              platformId,
              accountId: existingData.account.id,
              action,
              newData: accountData,
            });
          } else {
            // No conflict - mark for addition
            newAccountsToAdd.push({ platformId, data: accountData });
          }
        }
      }

      // Phase 2: Apply all decisions
      let totalAccounts = 0;
      let updatedAccounts = 0;
      let skippedAccounts = 0;

      // Add new accounts
      for (const item of newAccountsToAdd) {
        await addAccount(item.platformId, item.data);
        totalAccounts++;
      }

      // Apply conflict resolutions
      for (const decision of decisionsToApply) {
        if (decision.action === "update") {
          await updateAccount(decision.platformId, decision.accountId, decision.newData);
          updatedAccounts++;
        } else {
          skippedAccounts++;
        }
      }

      // Show success message
      const messages = [];
      if (totalAccounts > 0) messages.push(`${totalAccounts} new`);
      if (updatedAccounts > 0) messages.push(`${updatedAccounts} updated`);
      if (skippedAccounts > 0) messages.push(`${skippedAccounts} skipped`);

      showToastMessage(
        `Import complete: ${messages.join(", ")} account(s) from ${platformNames.length} platform(s)`,
        "success"
      );

      setInputText("");
    } catch (error) {
      console.error("Import error:", error);
      showToastMessage("Import failed. Please try again", "error");
    } finally {
      setIsProcessing(false);
      globalResolutionRef.current = null;
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
          <Ionicons name="cloud-upload" size={36} color={colors.accent} />
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
            Paste your formatted text below
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
              size={20}
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
                      pass123{"\n"}DOB - 01/01/2000{"\n\n"}Email - user2@gmail.com{"\n"}Password -
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
            <Ionicons name="trash-outline" size={18} color={colors.accent} />
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
              size={18}
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

      {/* Conflict Resolution Modal */}
      <ConflictModal
        visible={conflictModalVisible}
        conflict={currentConflict}
        onDecision={handleDecision}
      />

      <Toast message={toastMessage} visible={showToast} type={toastType} />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 30 },
  header: { alignItems: "center", marginVertical: 12, gap: 6 },
  title: { fontSize: 24, marginTop: 6 },
  subtitle: { fontSize: 13, textAlign: "center", paddingHorizontal: 20 },
  guideCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  guideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guideTitle: { fontSize: 15 },
  guideContent: { marginTop: 12 },
  guideText: { fontSize: 12, lineHeight: 20, marginBottom: 12 },
  exampleBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  exampleTitle: { fontSize: 13, marginBottom: 6 },
  exampleText: { fontSize: 11, lineHeight: 16 },
  inputCard: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  textInput: { 
    fontSize: 13, 
    lineHeight: 19,
    height: 300,
    textAlignVertical: "top",
  },
  buttonRow: { flexDirection: "row", gap: 10 },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  clearButton: { borderWidth: 1 },
  importButton: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: { fontSize: 14 },
});
