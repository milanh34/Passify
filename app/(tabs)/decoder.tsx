// app/(tabs)/decoder.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useDb } from "../../src/context/DbContext";
import { useAuth } from "../../src/context/AuthContext";
import { useInactivityTracker } from "../../src/utils/inactivityTracker";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import Toast from "../../src/components/Toast";
import ProgressBar from "../../src/components/ProgressBar";
import DecodedDataDisplay from "../../src/components/DecodedDataDisplay";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { decryptData } from "../../src/utils/crypto";
import {
  unpackHeader,
  calculateChecksum,
  decodeFromPixels,
  BLOCK_CONSTANTS,
} from "../../src/utils/blocks";
import { loadPNGAsPixels } from "../../src/utils/image";
import { ThrottledProgress, ProgressUpdate } from "../../src/types/progress";
import { generateExportText, toTitleCase } from "../../src/utils/transferParser";
import { log } from "@/src/utils/logger";

interface DecodedData {
  database: Record<string, any[]>;
  schemas: Record<string, string[]>;
}

export default function DecoderScreen() {
  const theme = useAppTheme();
  const { database, schemas, addPlatform, addAccount, updateAccount, updatePlatformSchema } =
    useDb();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [animationKey, setAnimationKey] = useState(0);

  const { isAuthEnabled } = useAuth();
  const { updateActivity } = useInactivityTracker(isAuthEnabled);

  const [imageUri, setImageUri] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("success");

  const [viewMode, setViewMode] = useState<"formatted" | "text">("formatted");
  const [exportText, setExportText] = useState("");

  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate>({
    phase: "readFile",
    processedBytes: 0,
    totalBytes: 0,
    percent: 0,
  });
  const [showProgress, setShowProgress] = useState(false);

  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const progressCallbacksRef = useRef<Set<Function>>(new Set());

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;
      progressCallbacksRef.current.clear();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setAnimationKey((prev) => prev + 1);

      if (isAuthEnabled && !isProcessingRef.current) {
        updateActivity();
      }
    }, [isAuthEnabled, updateActivity])
  );

  const showToastMessage = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    if (!isMountedRef.current) return;
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        setShowToast(false);
      }
    }, 3000);
  };

  const cleanup = () => {
    isProcessingRef.current = false;
    progressCallbacksRef.current.clear();

    if (isMountedRef.current) {
      setLoading(false);
      setShowProgress(false);
      setProgressUpdate({
        phase: "readFile",
        processedBytes: 0,
        totalBytes: 0,
        percent: 0,
      });
    }
  };

  const handleRefresh = async () => {
    if (isProcessingRef.current) {
      log.info("🛑 Cancelling ongoing decode...");
      cleanup();
    }

    setRefreshing(true);
    setImageUri("");
    setPassword("");
    setDecodedData(null);
    setExportText("");
    setViewMode("formatted");
    setLoading(false);
    setShowProgress(false);
    setProgressUpdate({
      phase: "readFile",
      processedBytes: 0,
      totalBytes: 0,
      percent: 0,
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (isMountedRef.current) {
      setRefreshing(false);
    }

    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/png",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        showToastMessage("Image loaded", "info");
      }

      if (isAuthEnabled) {
        updateActivity();
      }
    } catch (error: any) {
      showToastMessage(`Failed to pick image: ${error.message}`, "error");
    }
  };

  const safeProgressUpdate = (update: ProgressUpdate) => {
    if (isMountedRef.current && isProcessingRef.current) {
      log.info(`📊 Progress: ${update.phase} - ${Math.round(update.percent)}%`);
      setProgressUpdate(update);
    }
  };

  const handleDecode = async () => {
    if (!imageUri) {
      showToastMessage("Please select an image", "error");
      return;
    }

    if (!password.trim()) {
      showToastMessage("Please enter password", "error");
      return;
    }

    if (isProcessingRef.current) {
      showToastMessage("A process is already running", "error");
      return;
    }

    if (isAuthEnabled) {
      updateActivity();
    }

    isProcessingRef.current = true;
    setLoading(true);
    setShowProgress(true);
    progressCallbacksRef.current.add(safeProgressUpdate);

    try {
      if (!isProcessingRef.current) return;

      safeProgressUpdate({
        phase: "readFile",
        processedBytes: 0,
        totalBytes: 100,
        percent: 0,
      });

      let pixels: Uint8Array;
      let width: number;
      let height: number;

      try {
        const result = await loadPNGAsPixels(imageUri, (phase, percent) => {
          if (isProcessingRef.current) {
            safeProgressUpdate({
              phase: phase as any,
              processedBytes: Math.round(percent),
              totalBytes: 100,
              percent,
            });
          }
        });
        pixels = result.pixels;
        width = result.width;
        height = result.height;
      } catch (error: any) {
        throw new Error(`Failed to read image file: ${error.message}`);
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      let header;
      try {
        const progress = new ThrottledProgress((update) => {
          if (isProcessingRef.current) {
            safeProgressUpdate(update);
          }
        });

        const headerBytes = decodeFromPixels(pixels, BLOCK_CONSTANTS.HEADER_SIZE, progress);
        header = unpackHeader(headerBytes);

        if (header.width !== width || header.height !== height) {
          throw new Error("Image dimensions don't match header data");
        }
      } catch (error: any) {
        if (error.message.includes("Invalid magic number")) {
          throw new Error("This is not a valid Passify backup image");
        } else if (error.message.includes("Unsupported version")) {
          throw new Error("Image was created with an incompatible version");
        } else {
          throw new Error(`Failed to decode image header: ${error.message}`);
        }
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      let encryptedData: Uint8Array;
      try {
        const progress = new ThrottledProgress((update) => {
          if (isProcessingRef.current) {
            safeProgressUpdate(update);
          }
        });

        const fullDataLength = BLOCK_CONSTANTS.HEADER_SIZE + header.dataLength;
        const fullData = decodeFromPixels(pixels, fullDataLength, progress);
        encryptedData = fullData.slice(BLOCK_CONSTANTS.HEADER_SIZE);
      } catch (error: any) {
        throw new Error(`Failed to extract encrypted data: ${error.message}`);
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      try {
        safeProgressUpdate({
          phase: "unpack",
          processedBytes: encryptedData.length,
          totalBytes: encryptedData.length,
          percent: 100,
        });

        const checksum = calculateChecksum(encryptedData);
        if (checksum !== header.checksum) {
          throw new Error("Image data is corrupted or has been tampered with");
        }
      } catch (error: any) {
        throw new Error(`Data integrity check failed: ${error.message}`);
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      let decryptedJson: string;
      try {
        decryptedJson = await decryptData(encryptedData, password, (update) => {
          if (isProcessingRef.current) {
            safeProgressUpdate(update);
          }
        });
      } catch (error: any) {
        if (error.message.includes("Authentication failed")) {
          throw new Error("Incorrect password. Please try again.");
        } else {
          throw new Error(`Decryption failed: ${error.message}`);
        }
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      let parsed: DecodedData;
      try {
        safeProgressUpdate({
          phase: "parseJSON",
          processedBytes: 0,
          totalBytes: decryptedJson.length,
          percent: 0,
        });

        parsed = JSON.parse(decryptedJson);

        if (!parsed.database || !parsed.schemas) {
          throw new Error("Invalid data format");
        }

        safeProgressUpdate({
          phase: "parseJSON",
          processedBytes: decryptedJson.length,
          totalBytes: decryptedJson.length,
          percent: 100,
        });
      } catch (error: any) {
        throw new Error(`Failed to parse decrypted data: ${error.message}`);
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      if (isMountedRef.current) {
        setDecodedData(parsed);
        setViewMode("formatted");

        safeProgressUpdate({
          phase: "done",
          processedBytes: 100,
          totalBytes: 100,
          percent: 100,
        });

        showToastMessage("Successfully decoded!", "success");
      }
    } catch (error: any) {
      if (isMountedRef.current && isProcessingRef.current) {
        log.error("🔴 Decoding error:", error);
        const errorMessage = error.message || "An unexpected error occurred during decoding";
        showToastMessage(errorMessage, "error");
        setDecodedData(null);
        setExportText("");
      }
    } finally {
      cleanup();

      setTimeout(() => {
        if (isMountedRef.current) {
          setShowProgress(false);
        }
      }, 1000);

      if (isAuthEnabled) {
        updateActivity();
      }
    }
  };

  const handleImportToAccounts = async () => {
    if (!decodedData) return;

    setLoading(true);

    if (isAuthEnabled) {
      updateActivity();
    }

    try {
      let importedCount = 0;
      let updatedCount = 0;

      for (const [platformId, accounts] of Object.entries(decodedData.database)) {
        const platformName = toTitleCase(platformId.replace(/_/g, " "));

        if (!database[platformId]) {
          addPlatform(platformId, platformName);
        }

        const existingSchema = schemas[platformId] || [];
        const newSchema = decodedData.schemas[platformId] || [];
        const mergedSchema = Array.from(new Set([...existingSchema, ...newSchema]));

        if (mergedSchema.length > existingSchema.length) {
          updatePlatformSchema(platformId, mergedSchema);
        }

        for (const account of accounts) {
          const existingAccounts = database[platformId] || [];
          const identifierField = account.email ? "email" : account.username ? "username" : null;
          const duplicate = identifierField
            ? existingAccounts.find((a: any) => a[identifierField] === account[identifierField])
            : null;

          if (duplicate) {
            updateAccount(platformId, duplicate.id, account);
            updatedCount++;
          } else {
            addAccount(platformId, account);
            importedCount++;
          }
        }
      }

      showToastMessage(`Import complete! ${importedCount} new, ${updatedCount} updated`, "success");

      setTimeout(() => {
        if (isMountedRef.current) {
          router.push("/(tabs)");
        }
      }, 1000);
    } catch (error: any) {
      log.error("Import error:", error);
      showToastMessage(`Import failed: ${error.message}`, "error");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }

      if (isAuthEnabled) {
        updateActivity();
      }
    }
  };

  const handleGetFormattedText = () => {
    if (!decodedData) return;

    const formattedText = generateExportText(decodedData.database, decodedData.schemas);

    setExportText(formattedText);
    setViewMode("text");
    showToastMessage("Switched to text export view", "info");

    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleCopyText = async () => {
    if (exportText) {
      await Clipboard.setStringAsync(exportText);
      showToastMessage("Copied to clipboard", "success");

      if (isAuthEnabled) {
        updateActivity();
      }
    }
  };

  const handleShowFormatted = () => {
    setViewMode("formatted");
    if (isAuthEnabled) {
      updateActivity();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <MotiView
        key={animationKey}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: "timing",
          duration: theme.animations.durationNormal,
        }}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + theme.spacing.xl,
              paddingBottom: insets.bottom + theme.spacing.xxl,
              paddingHorizontal: theme.spacing.xl,
              gap: theme.spacing.xxl,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.accent}
              colors={[theme.colors.accent]}
            />
          }
        >
          <View>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.typography.sizeXxl,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Decode from Image
            </Text>

            <Text
              style={{
                color: theme.colors.textMuted,
                fontFamily: theme.typography.fontRegular,
                fontSize: theme.typography.sizeLg,
              }}
            >
              Recover your account data from a colored encrypted image.
            </Text>
          </View>

          <Pressable
            onPress={handlePickImage}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.colors.accentSecondary,
                opacity: loading ? 0.7 : pressed ? 0.8 : 1,
                borderRadius: theme.components.button.radius,
                height: theme.components.button.height,
              },
            ]}
          >
            <Ionicons name="folder-open" size={20} color={theme.colors.textInverse} />
            <Text
              style={{
                fontFamily: theme.typography.fontBold,
                fontSize: theme.components.button.fontSize,
                color: theme.colors.textInverse,
              }}
            >
              {imageUri ? "Change Image" : "Select Image"}
            </Text>
          </Pressable>

          {imageUri && (
            <Text
              style={{
                color: theme.colors.textMuted,
                fontFamily: theme.typography.fontRegular,
                fontSize: theme.typography.sizeMd,
                fontStyle: "italic",
              }}
            >
              {imageUri.split("/").pop()}
            </Text>
          )}

          <View style={[styles.section, { gap: theme.spacing.sm }]}>
            <Text
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontRegular,
                fontSize: theme.typography.sizeLg,
              }}
            >
              Password
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.surfaceBorder,
                  borderWidth: theme.shapes.borderThin,
                  borderRadius: theme.components.input.radius,
                  height: theme.components.input.height,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.textPrimary,
                    fontFamily: theme.typography.fontRegular,
                    fontSize: theme.components.input.fontSize,
                  },
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (isAuthEnabled) {
                    updateActivity();
                  }
                }}
                placeholder="Enter decryption password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <Pressable
                onPress={() => {
                  setShowPassword(!showPassword);
                  if (isAuthEnabled) {
                    updateActivity();
                  }
                }}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          {showProgress && (
            <ProgressBar
              percent={progressUpdate.percent}
              phase={progressUpdate.phase}
              processedBytes={progressUpdate.processedBytes}
              totalBytes={progressUpdate.totalBytes}
              visible={showProgress}
            />
          )}

          <Pressable
            onPress={handleDecode}
            disabled={loading || !imageUri}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.colors.buttonPrimary,
                opacity: !imageUri || loading ? 0.5 : pressed ? 0.8 : 1,
                borderRadius: theme.components.button.radius,
                height: theme.components.button.height,
              },
            ]}
          >
            {loading && !decodedData ? (
              <ActivityIndicator color={theme.colors.textInverse} />
            ) : (
              <>
                <Ionicons name="lock-open" size={20} color={theme.colors.textInverse} />
                <Text
                  style={{
                    fontFamily: theme.typography.fontBold,
                    fontSize: theme.components.button.fontSize,
                    color: theme.colors.textInverse,
                  }}
                >
                  Decode Image
                </Text>
              </>
            )}
          </Pressable>

          {decodedData && !loading && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: theme.animations.durationNormal }}
              style={[styles.section, { gap: theme.spacing.md }]}
            >
              <View
                style={[
                  styles.successCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.accent,
                    borderWidth: theme.shapes.borderThick,
                    borderRadius: theme.components.card.radius,
                    padding: theme.spacing.xxl,
                  },
                ]}
              >
                <Ionicons name="checkmark-circle" size={48} color={theme.colors.accent} />
                <Text
                  style={{
                    color: theme.colors.textPrimary,
                    fontFamily: theme.typography.fontBold,
                    fontSize: theme.typography.sizeXl,
                    textAlign: "center",
                  }}
                >
                  Decoding Successful!
                </Text>
                <Text
                  style={{
                    color: theme.colors.textMuted,
                    fontFamily: theme.typography.fontRegular,
                    fontSize: theme.typography.sizeMd,
                    textAlign: "center",
                  }}
                >
                  {Object.keys(decodedData.database).length} platforms •{" "}
                  {Object.values(decodedData.database).flat().length} accounts
                </Text>
              </View>

              <View style={[styles.actionButtons, { gap: theme.spacing.md }]}>
                <Pressable
                  onPress={handleImportToAccounts}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.button,
                    {
                      backgroundColor: theme.colors.buttonPrimary,
                      borderRadius: theme.components.button.radius,
                      height: theme.components.button.height,
                      opacity: loading ? 0.6 : pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.colors.textInverse} size="small" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={20} color={theme.colors.textInverse} />
                      <Text
                        style={{
                          fontFamily: theme.typography.fontBold,
                          color: theme.colors.textInverse,
                        }}
                      >
                        Import to Accounts
                      </Text>
                    </>
                  )}
                </Pressable>

                {viewMode === "formatted" ? (
                  <Pressable
                    onPress={handleGetFormattedText}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.surfaceBorder,
                        borderWidth: theme.shapes.borderThin,
                        borderRadius: theme.components.button.radius,
                        height: theme.components.button.height,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="document-text" size={20} color={theme.colors.textPrimary} />
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontBold,
                      }}
                    >
                      Get Text Export
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleShowFormatted}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.surfaceBorder,
                        borderWidth: theme.shapes.borderThin,
                        borderRadius: theme.components.button.radius,
                        height: theme.components.button.height,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Ionicons name="list" size={20} color={theme.colors.textPrimary} />
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontBold,
                      }}
                    >
                      Show Formatted View
                    </Text>
                  </Pressable>
                )}
              </View>

              {viewMode === "formatted" ? (
                <DecodedDataDisplay
                  decodedData={decodedData}
                  onCopyField={(value) => showToastMessage("Copied to clipboard", "info")}
                />
              ) : (
                <View style={[styles.section, { gap: theme.spacing.sm }]}>
                  <View style={styles.labelRow}>
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontRegular,
                        fontSize: theme.typography.sizeLg,
                      }}
                    >
                      Text Export
                    </Text>
                    <Pressable onPress={handleCopyText} style={styles.copyButton}>
                      <Ionicons name="copy-outline" size={18} color={theme.colors.accent} />
                      <Text
                        style={{
                          color: theme.colors.accent,
                          fontFamily: theme.typography.fontRegular,
                          fontSize: theme.typography.sizeMd,
                        }}
                      >
                        Copy All
                      </Text>
                    </Pressable>
                  </View>

                  <ScrollView
                    style={[
                      styles.outputBox,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.surfaceBorder,
                        borderWidth: theme.shapes.borderThin,
                        borderRadius: theme.shapes.radiusMd,
                        padding: theme.spacing.lg,
                      },
                    ]}
                    nestedScrollEnabled
                  >
                    <Text
                      style={{
                        color: theme.colors.textPrimary,
                        fontFamily: theme.typography.fontRegular,
                        fontSize: theme.typography.sizeMd,
                        lineHeight: 20,
                      }}
                    >
                      {exportText}
                    </Text>
                  </ScrollView>
                </View>
              )}
            </MotiView>
          )}
        </ScrollView>
      </MotiView>

      <Toast message={toastMessage} visible={showToast} type={toastType} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  title: {},
  section: {},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  successCard: {
    alignItems: "center",
    gap: 8,
  },
  actionButtons: {},
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  outputBox: {
    maxHeight: 300,
  },
});
