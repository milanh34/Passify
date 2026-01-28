// app/(tabs)/encoder.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useDb } from "../../src/context/DbContext";
import { useAuth } from "../../src/context/AuthContext";
import { useInactivityTracker } from "../../src/utils/inactivityTracker";
import { useAppTheme } from "../../src/themes/hooks/useAppTheme";
import ProgressBar from "../../src/components/ProgressBar";
import Toast from "../../src/components/Toast";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { encryptData } from "../../src/utils/crypto";
import {
  calculateDimensions,
  packHeader,
  calculateChecksum,
  encodeToPixels,
  BLOCK_CONSTANTS,
} from "../../src/utils/blocks";
import { savePixelsAsPNG, getBase64FromUri } from "../../src/utils/image";
import { saveFileWithSAF, shareFile } from "../../src/utils/safFileManager";
import { ThrottledProgress, ProgressUpdate } from "../../src/types/progress";
import { Platform } from "react-native";
import { log } from "@/src/utils/logger";

export default function EncoderScreen() {
  const theme = useAppTheme();
  const { database, schemas } = useDb();
  const insets = useSafeAreaInsets();
  const { isAuthEnabled } = useAuth();
  const { updateActivity } = useInactivityTracker(isAuthEnabled);

  const [animationKey, setAnimationKey] = useState(0);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imageUri, setImageUri] = useState("");
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("success");

  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate>({
    phase: "stringify",
    processedBytes: 0,
    totalBytes: 0,
    percent: 0,
  });
  const [showProgress, setShowProgress] = useState(false);

  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;
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
    msg: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    if (!isMountedRef.current) return;
    setToastMessage(msg);
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
    if (isMountedRef.current) {
      setLoading(false);
      setShowProgress(false);
      setProgressUpdate({
        phase: "stringify",
        processedBytes: 0,
        totalBytes: 0,
        percent: 0,
      });
    }
  };

  const handleRefresh = async () => {
    if (isProcessingRef.current) {
      log.info("Cancelling ongoing encode...");
      cleanup();
    }

    setRefreshing(true);
    setPassword("");
    setImageUri("");
    setFilename("");
    setLoading(false);
    setShowProgress(false);
    setProgressUpdate({
      phase: "stringify",
      processedBytes: 0,
      totalBytes: 0,
      percent: 0,
    });

    await new Promise((r) => setTimeout(r, 300));

    if (isMountedRef.current) {
      setRefreshing(false);
    }

    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const onProgress = (update: ProgressUpdate) => {
    if (isMountedRef.current && isProcessingRef.current) {
      log.info(`Progress: ${update.phase} - ${Math.round(update.percent)}%`);
      setProgressUpdate(update);
    }
  };

  const handleEncode = async () => {
    if (!password.trim()) {
      showToastMessage("Please enter a password", "error");
      return;
    }

    if (isProcessingRef.current) {
      showToastMessage("Encoding already in progress", "error");
      return;
    }

    if (isAuthEnabled) {
      updateActivity();
    }

    isProcessingRef.current = true;
    setLoading(true);
    setShowProgress(true);

    try {
      let dataToEncrypt: string;
      try {
        dataToEncrypt = JSON.stringify({ database, schemas });
        onProgress({
          phase: "stringify",
          processedBytes: dataToEncrypt.length,
          totalBytes: dataToEncrypt.length,
          percent: 100,
        });
      } catch (error: any) {
        throw new Error(`Failed to serialize data: ${error.message}`);
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      let encryptedBytes: Uint8Array;
      try {
        encryptedBytes = await encryptData(dataToEncrypt, password, onProgress);
      } catch (error: any) {
        throw new Error(`Encryption failed: ${error.message}`);
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      const { width, height } = calculateDimensions(encryptedBytes.length);

      let fullData: Uint8Array;
      try {
        const header = {
          magic: BLOCK_CONSTANTS.MAGIC_NUMBER,
          version: BLOCK_CONSTANTS.VERSION,
          mode: BLOCK_CONSTANTS.MODE_1X1,
          width,
          height,
          dataLength: encryptedBytes.length,
          checksum: calculateChecksum(encryptedBytes),
          reserved: 0,
        };

        const headerBytes = packHeader(header);
        fullData = new Uint8Array(headerBytes.length + encryptedBytes.length);
        fullData.set(headerBytes);
        fullData.set(encryptedBytes, headerBytes.length);
      } catch (error: any) {
        throw new Error(`Failed to create image header: ${error.message}`);
      }

      if (!isProcessingRef.current) return;

      let pixels: Uint8Array;
      try {
        const progress = new ThrottledProgress(onProgress);
        pixels = encodeToPixels(fullData, width, height, progress);
        progress.done();
      } catch (error: any) {
        throw new Error(`Failed to encode pixels: ${error.message}`);
      }

      if (!isProcessingRef.current) return;
      await new Promise((r) => setTimeout(r, 100));

      const generatedFilename = `passify_backup_${Date.now()}.png`;
      let cacheUri: string;

      try {
        const result = await savePixelsAsPNG(
          pixels,
          width,
          height,
          generatedFilename,
          (phase: string, percent: number) => {
            onProgress({
              phase: phase as any,
              processedBytes: percent,
              totalBytes: 100,
              percent,
            });
          }
        );

        cacheUri = result.cacheUri;
      } catch (error: any) {
        throw new Error(`Failed to save image: ${error.message}`);
      }

      if (!isProcessingRef.current) return;

      if (isMountedRef.current) {
        setImageUri(cacheUri);
        setFilename(generatedFilename);

        onProgress({
          phase: "done",
          processedBytes: 100,
          totalBytes: 100,
          percent: 100,
        });

        showToastMessage("Image generated successfully! Use Download or Share to save.", "success");
      }
    } catch (error: any) {
      log.error("Encoding error:", error);
      if (isMountedRef.current && isProcessingRef.current) {
        const errorMessage = error.message || "An unexpected error occurred during encoding";
        showToastMessage(errorMessage, "error");
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

  const handleSharePress = async () => {
    if (!imageUri) return;

    setLoading(true);
    const success = await shareFile(imageUri, "image/png");
    setLoading(false);

    if (!success) {
      showToastMessage("Failed to share file", "error");
    }

    if (isAuthEnabled) {
      updateActivity();
    }
  };

  const handleDownloadPress = async () => {
    if (!imageUri || !filename) return;

    if (isAuthEnabled) {
      updateActivity();
    }

    setLoading(true);

    try {
      const base64Content = await getBase64FromUri(imageUri);
      const result = await saveFileWithSAF(filename, base64Content, "image/png");

      if (result.success) {
        showToastMessage("File saved successfully!", "success");
      } else {
        showToastMessage(result.error || "Failed to save file", "error");
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to save file", "error");
    } finally {
      setLoading(false);
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
              paddingHorizontal: theme.spacing.xl,
              paddingBottom: insets.bottom + theme.spacing.xxl,
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
            Encode to Image
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.textMuted,
                fontFamily: theme.typography.fontRegular,
                fontSize: theme.typography.sizeLg,
                marginBottom: theme.spacing.xxl,
              },
            ]}
          >
            Create an encrypted backup image from your account data
          </Text>

          <View style={[styles.section, { marginBottom: theme.spacing.lg }]}>
            <Text
              style={[
                styles.label,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.typography.fontRegular,
                  fontSize: theme.typography.sizeLg,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Encryption Password
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
                secureTextEntry={!showPassword}
                editable={!loading}
                placeholder="Enter a strong password"
                placeholderTextColor={theme.colors.textMuted}
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
            <View style={{ marginBottom: theme.spacing.lg }}>
              <ProgressBar
                percent={progressUpdate.percent}
                phase={progressUpdate.phase}
                processedBytes={progressUpdate.processedBytes}
                totalBytes={progressUpdate.totalBytes}
                visible={showProgress}
              />
            </View>
          )}

          <Pressable
            onPress={handleEncode}
            disabled={loading || !password.trim()}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: theme.colors.buttonPrimary,
                opacity: loading || !password.trim() ? 0.5 : pressed ? 0.8 : 1,
                borderRadius: theme.components.button.radius,
                height: theme.components.button.height,
                marginBottom: theme.spacing.lg,
              },
            ]}
          >
            {loading && !imageUri ? (
              <ActivityIndicator color={theme.colors.textInverse} />
            ) : (
              <Ionicons name="lock-closed" size={20} color={theme.colors.textInverse} />
            )}
            <Text
              style={[
                styles.buttonText,
                {
                  fontFamily: theme.typography.fontBold,
                  fontSize: theme.components.button.fontSize,
                  color: theme.colors.textInverse,
                },
              ]}
            >
              Generate Encrypted Image
            </Text>
          </Pressable>

          {imageUri && !loading && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: theme.animations.durationNormal }}
              style={styles.section}
            >
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.colors.textPrimary,
                    fontFamily: theme.typography.fontRegular,
                    fontSize: theme.typography.sizeLg,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
              >
                Generated Backup Image
              </Text>
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.imagePreview,
                  {
                    borderRadius: theme.shapes.radiusMd,
                    borderWidth: theme.shapes.borderThin,
                    borderColor: theme.colors.surfaceBorder,
                  },
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.fileInfo,
                  {
                    color: theme.colors.textMuted,
                    fontFamily: theme.typography.fontRegular,
                    fontSize: theme.typography.sizeSm,
                    marginTop: theme.spacing.sm,
                  },
                ]}
              >
                {filename}
              </Text>

              <View
                style={[
                  styles.buttonRow,
                  { marginVertical: theme.spacing.md, gap: theme.spacing.md },
                ]}
              >
                <Pressable
                  onPress={handleSharePress}
                  style={({ pressed }) => [
                    styles.buttonHalf,
                    {
                      backgroundColor: theme.colors.accentSecondary,
                      borderRadius: theme.components.button.radius,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Ionicons name="share-outline" size={20} color={theme.colors.textInverse} />
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        fontFamily: theme.typography.fontBold,
                        color: theme.colors.textInverse,
                        marginLeft: 8,
                      },
                    ]}
                  >
                    Share
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDownloadPress}
                  style={({ pressed }) => [
                    styles.buttonHalf,
                    {
                      backgroundColor: theme.colors.accent,
                      borderRadius: theme.components.button.radius,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Ionicons name="download-outline" size={20} color={theme.colors.textInverse} />
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        fontFamily: theme.typography.fontBold,
                        color: theme.colors.textInverse,
                        marginLeft: 8,
                      },
                    ]}
                  >
                    Download
                  </Text>
                </Pressable>
              </View>

              {Platform.OS === "android" && (
                <Text
                  style={[
                    styles.infoText,
                    {
                      color: theme.colors.accent,
                      fontFamily: theme.typography.fontRegular,
                      fontSize: theme.typography.sizeMd,
                    },
                  ]}
                >
                  Download will let you choose where to save the file
                </Text>
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
  subtitle: {},
  section: {},
  label: {},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  eyeIcon: {
    paddingLeft: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {},
  buttonRow: {
    flexDirection: "row",
  },
  buttonHalf: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    marginTop: 8,
  },
  fileInfo: {
    fontStyle: "italic",
  },
  infoText: {
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
