// src/components/transfer/ImportTab.tsx

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDb } from "../../context/DbContext";
import { useAppTheme } from "../../themes/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { parseTransferText, toTitleCase } from "../../utils/transferParser";
import Toast from "../Toast";
import ConflictModal from "./ConflictModal";
import { log } from "@/src/utils/logger";

type ConflictResolution = "update" | "skip";

interface ConflictDecision {
  platformId: string;
  accountId: string;
  action: ConflictResolution;
  newData: any;
}

export default function ImportTab() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { database, schemas, addPlatform, addAccount, updateAccount, updatePlatformSchema } =
    useDb();
  const router = useRouter();

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("success");

  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<{
    platformName: string;
    existingAccount: any;
    newAccount: any;
    identifierField: string;
  } | null>(null);

  const [expandModalVisible, setExpandModalVisible] = useState(false);
  const [expandedText, setExpandedText] = useState("");

  const globalResolutionRef = useRef<ConflictResolution | null>(null);
  const resolutionCallbackRef = useRef<((action: ConflictResolution) => void) | null>(null);

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getIdentifierField = (account: any): { field: string; value: string } | null => {
    if (account.email) return { field: "email", value: account.email };
    if (account.gmail) return { field: "gmail", value: account.gmail };
    if (account.username) return { field: "username", value: account.username };
    return null;
  };

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

      resolutionCallbackRef.current = (action: ConflictResolution) => {
        resolve(action);
        resolutionCallbackRef.current = null;
      };
    });
  };

  const handleDecision = (action: ConflictResolution, applyToAll: boolean) => {
    if (applyToAll) {
      globalResolutionRef.current = action;
    }

    setConflictModalVisible(false);

    if (resolutionCallbackRef.current) {
      resolutionCallbackRef.current(action);
    }
  };

  const handleOpenExpandModal = () => {
    setExpandedText(inputText);
    setExpandModalVisible(true);
  };

  const handleCloseExpandModal = () => {
    setExpandModalVisible(false);
  };

  const handleSaveExpandedText = () => {
    setInputText(expandedText);
    setExpandModalVisible(false);
  };

  const handleImport = async () => {
    if (!inputText.trim()) {
      showToastMessage("Please paste some text to import", "warning");
      return;
    }

    setIsProcessing(true);
    globalResolutionRef.current = null;

    try {
      const parsedData = parseTransferText(inputText);
      const platformNames = Object.keys(parsedData);

      if (platformNames.length === 0) {
        showToastMessage("Could not parse the text. Please check the format", "error");
        setIsProcessing(false);
        return;
      }

      const newAccountsToAdd: Array<{ platformId: string; data: any }> = [];
      const decisionsToApply: ConflictDecision[] = [];

      for (const platformName of platformNames) {
        const accounts = parsedData[platformName];
        const titleCaseName = toTitleCase(platformName);
        const platformId = platformName.toLowerCase().replace(/\s+/g, "_");

        const platformExists = !!database[platformId];

        if (!platformExists) {
          await addPlatform(platformId);
        }

        const newFields = new Set<string>();
        accounts.forEach((acc) => {
          Object.keys(acc).forEach((field) => newFields.add(field));
        });

        const existingSchema = schemas[platformId] || [];
        const mergedFields = new Set([...existingSchema, ...Array.from(newFields)]);

        const finalSchema: string[] = [];

        if (mergedFields.has("name")) {
          finalSchema.push("name");
          mergedFields.delete("name");
        }

        if (mergedFields.has("password")) {
          finalSchema.push("password");
          mergedFields.delete("password");
        }

        existingSchema.forEach((field) => {
          if (field !== "name" && field !== "password" && mergedFields.has(field)) {
            finalSchema.push(field);
            mergedFields.delete(field);
          }
        });

        mergedFields.forEach((field) => {
          if (field !== "id") {
            finalSchema.push(field);
          }
        });

        if (!platformExists || finalSchema.length !== existingSchema.length) {
          await updatePlatformSchema(platformId, finalSchema);
        }

        for (let i = 0; i < accounts.length; i++) {
          const accountData = { ...accounts[i] };

          if (!accountData.name) {
            const emailName = getNameFromEmail(accountData);
            accountData.name = emailName || `Account ${i + 1}`;
          }

          if (!accountData.password) {
            accountData.password = "";
          }

          accountData.platform = titleCaseName;

          const existingData = findExistingAccount(platformId, accountData);

          if (existingData) {
            let action: ConflictResolution;

            if (globalResolutionRef.current) {
              action = globalResolutionRef.current;
            } else {
              action = await askUserForResolution(
                titleCaseName,
                existingData.account,
                accountData,
                existingData.field
              );
            }

            decisionsToApply.push({
              platformId,
              accountId: existingData.account.id,
              action,
              newData: accountData,
            });
          } else {
            newAccountsToAdd.push({ platformId, data: accountData });
          }
        }
      }

      let totalAccounts = 0;
      let updatedAccounts = 0;
      let skippedAccounts = 0;

      for (const item of newAccountsToAdd) {
        await addAccount(item.platformId, item.data);
        totalAccounts++;
      }

      for (const decision of decisionsToApply) {
        if (decision.action === "update") {
          await updateAccount(decision.platformId, decision.accountId, decision.newData);
          updatedAccounts++;
        } else {
          skippedAccounts++;
        }
      }

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
      log.error("Import error:", error);
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="cloud-upload" size={36} color={theme.colors.accent} />
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
            ]}
          >
            Import Data
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary, fontFamily: theme.typography.fontRegular },
            ]}
          >
            Paste your formatted text below
          </Text>
        </View>

        <Pressable
          onPress={() => setIsGuideExpanded(!isGuideExpanded)}
          style={[
            styles.guideCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isGuideExpanded ? theme.colors.accent : theme.colors.surfaceBorder,
              borderRadius: theme.components.card.radius,
              padding: theme.components.card.padding,
            },
          ]}
        >
          <View style={styles.guideHeader}>
            <Text
              style={[
                styles.guideTitle,
                { color: theme.colors.accentSecondary, fontFamily: theme.typography.fontBold },
              ]}
            >
              Format Guide
            </Text>
            <Ionicons
              name={isGuideExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.accent}
            />
          </View>

          <AnimatePresence>
            {isGuideExpanded && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "timing", duration: theme.animations.durationNormal }}
              >
                <View style={styles.guideContent}>
                  <Text
                    style={[
                      styles.guideText,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontRegular,
                      },
                    ]}
                  >
                    • Platform name on first line{"\n"}• Two blank lines after platform name{"\n"}•
                    Field lines: "Key - Value"{"\n"}• Two blank lines between accounts{"\n"}• Three
                    blank lines between platforms
                  </Text>

                  <View
                    style={[
                      styles.exampleBox,
                      {
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.accentMuted,
                        borderRadius: theme.shapes.radiusMd,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.exampleTitle,
                        { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
                      ]}
                    >
                      Example:
                    </Text>
                    <Text
                      style={[
                        styles.exampleText,
                        {
                          color: theme.colors.textPrimary,
                          fontFamily: theme.typography.fontRegular,
                        },
                      ]}
                    >
                      Google{"\n\n"}Email - user@gmail.com{"\n"}Password - pass123{"\n"}DOB -
                      01/01/2000{"\n\n"}Email - user2@gmail.com{"\n"}Password - pass456{"\n\n\n"}
                      Instagram
                      {"\n\n"}Username - myhandle
                      {"\n"}Password - instapass
                    </Text>
                  </View>
                </View>
              </MotiView>
            )}
          </AnimatePresence>
        </Pressable>

        <View
          style={[
            styles.inputCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.surfaceBorder,
              borderRadius: theme.components.card.radius,
            },
          ]}
        >
          <View style={styles.inputHeader}>
            <Text
              style={[
                styles.inputLabel,
                { color: theme.colors.textSecondary, fontFamily: theme.typography.fontBold },
              ]}
            >
              Paste Data
            </Text>
            <Pressable
              onPress={handleOpenExpandModal}
              style={[
                styles.expandButton,
                {
                  backgroundColor: theme.colors.accentMuted,
                  borderRadius: theme.shapes.radiusSm,
                },
              ]}
            >
              <Ionicons name="expand-outline" size={18} color={theme.colors.accent} />
              <Text
                style={[
                  styles.expandButtonText,
                  { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
                ]}
              >
                Expand
              </Text>
            </Pressable>
          </View>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Paste your data here..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={8}
            style={[
              styles.textInput,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontRegular,
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.surfaceBorder,
                borderRadius: theme.shapes.radiusMd,
              },
            ]}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleClear}
            style={[
              styles.button,
              styles.clearButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.accent,
                borderRadius: theme.components.button.radius,
              },
            ]}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.accent} />
            <Text
              style={[
                styles.buttonText,
                { color: theme.colors.accent, fontFamily: theme.typography.fontBold },
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
              {
                backgroundColor: theme.colors.buttonPrimary,
                borderRadius: theme.components.button.radius,
              },
              isProcessing && { opacity: 0.6 },
            ]}
          >
            <Ionicons
              name={isProcessing ? "hourglass-outline" : "download-outline"}
              size={18}
              color={theme.colors.textInverse}
            />
            <Text
              style={[
                styles.buttonText,
                { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
              ]}
            >
              {isProcessing ? "Importing..." : "Import"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={expandModalVisible}
        animationType="slide"
        onRequestClose={handleCloseExpandModal}
      >
        <View style={[styles.expandModalContainer, { backgroundColor: theme.colors.background }]}>
          <View
            style={[
              styles.expandModalHeader,
              {
                paddingTop: insets.top + 12,
                borderBottomColor: theme.colors.surfaceBorder,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <Pressable
              onPress={handleCloseExpandModal}
              style={[
                styles.expandModalHeaderButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
            >
              <Ionicons name="close" size={22} color={theme.colors.textPrimary} />
            </Pressable>

            <Text
              style={[
                styles.expandModalTitle,
                { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
              ]}
            >
              Edit Import Data
            </Text>

            <Pressable
              onPress={handleSaveExpandedText}
              style={[
                styles.expandModalHeaderButton,
                {
                  backgroundColor: theme.colors.accent,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
            >
              <Ionicons name="checkmark" size={22} color={theme.colors.textInverse} />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.expandModalContent}
          >
            <TextInput
              value={expandedText}
              onChangeText={setExpandedText}
              placeholder="Paste your data here..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              autoFocus
              style={[
                styles.expandedTextInput,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontRegular,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.shapes.radiusMd,
                },
              ]}
              textAlignVertical="top"
            />
          </KeyboardAvoidingView>

          <View
            style={[
              styles.expandModalFooter,
              {
                paddingBottom: insets.bottom + 16,
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.surfaceBorder,
              },
            ]}
          >
            <Pressable
              onPress={handleCloseExpandModal}
              style={[
                styles.expandModalFooterButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.surfaceBorder,
                  borderRadius: theme.components.button.radius,
                },
              ]}
            >
              <Text
                style={[
                  styles.expandModalFooterButtonText,
                  { color: theme.colors.textPrimary, fontFamily: theme.typography.fontBold },
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSaveExpandedText}
              style={[
                styles.expandModalFooterButton,
                {
                  backgroundColor: theme.colors.buttonPrimary,
                  borderRadius: theme.components.button.radius,
                },
              ]}
            >
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.textInverse} />
              <Text
                style={[
                  styles.expandModalFooterButtonText,
                  { color: theme.colors.textInverse, fontFamily: theme.typography.fontBold },
                ]}
              >
                Save & Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
    padding: 12,
    borderWidth: 1,
  },
  exampleTitle: { fontSize: 13, marginBottom: 6 },
  exampleText: { fontSize: 11, lineHeight: 16 },
  inputCard: {
    marginBottom: 14,
    borderWidth: 1,
    padding: 12,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  expandButtonText: {
    fontSize: 12,
  },
  textInput: {
    fontSize: 13,
    lineHeight: 19,
    height: 180,
    textAlignVertical: "top",
    padding: 12,
    borderWidth: 1,
  },
  buttonRow: { flexDirection: "row", gap: 10 },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
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

  expandModalContainer: {
    flex: 1,
  },
  expandModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  expandModalHeaderButton: {
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  expandModalTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: "center",
  },
  expandModalContent: {
    flex: 1,
    padding: 16,
  },
  expandedTextInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    padding: 16,
    borderWidth: 1,
  },
  expandModalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  expandModalFooterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
  },
  expandModalFooterButtonText: {
    fontSize: 15,
  },
});