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
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import { useAuth } from "../../src/context/AuthContext";
import { useInactivityTracker } from "../../src/utils/inactivityTracker";
import ProgressBar from "../../src/components/ProgressBar";
import Toast from "../../src/components/Toast";
import { Ionicons } from "@expo/vector-icons";
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
import { useAnimation } from "../../src/context/AnimationContext";
import { MotiView } from "moti";
import { Platform } from "react-native";

export default function EncoderScreen() {
  const { colors, fontConfig } = useTheme();
  const { database, schemas } = useDb();
  const insets = useSafeAreaInsets();
  const { TAB_ANIMATION } = useAnimation();
  const [animationKey, setAnimationKey] = useState(0);
  const { isAuthEnabled } = useAuth();
  const { updateActivity } = useInactivityTracker(isAuthEnabled);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imageUri, setImageUri] = useState("");
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info" | "warning">("success");

  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

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
      console.log("Cancelling ongoing encode...");
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
      console.log(`Progress: ${update.phase} - ${Math.round(update.percent)}%`);
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
      let base64Content: string;

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
        base64Content = result.base64;
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
      console.error("Encoding error:", error);
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
        showToastMessage("✅ File saved successfully!", "success");
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
    <View style={[styles.container, { backgroundColor: colors.bg[0] }]}>
      <MotiView
        key={animationKey}
        from={TAB_ANIMATION.from}
        animate={TAB_ANIMATION.animate}
        transition={{
          type: TAB_ANIMATION.type,
          duration: TAB_ANIMATION.duration,
        }}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
            Encode to Image
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted, fontFamily: fontConfig.regular }]}>
            Create an encrypted backup image from your account data
          </Text>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
              Encryption Password
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text, fontFamily: fontConfig.regular }]}
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
                placeholderTextColor={colors.muted}
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
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.muted} />
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
            onPress={handleEncode}
            disabled={loading || !password.trim()}
            style={[
              styles.button,
              {
                backgroundColor: colors.accent,
                opacity: loading || !password.trim() ? 0.5 : 1,
              },
            ]}
          >
            {loading && !imageUri ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="lock-closed" size={20} color="#fff" />
            )}
            <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
              Generate Encrypted Image
            </Text>
          </Pressable>

          {imageUri && !loading && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
                Generated Backup Image
              </Text>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="contain" />
              <Text
                style={[styles.fileInfo, { color: colors.muted, fontFamily: fontConfig.regular }]}
              >
                {filename}
              </Text>

              <View style={styles.buttonRow}>
                <Pressable
                  onPress={handleSharePress}
                  style={[styles.buttonHalf, { backgroundColor: colors.accent2 }]}
                >
                  <Ionicons name="share-outline" size={20} color="#fff" />
                  <Text style={[styles.buttonText, { fontFamily: fontConfig.bold, marginLeft: 8 }]}>
                    Share
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleDownloadPress}
                  style={[styles.buttonHalf, { backgroundColor: colors.accent }]}
                >
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={[styles.buttonText, { fontFamily: fontConfig.bold, marginLeft: 8 }]}>
                    Download
                  </Text>
                </Pressable>
              </View>

              {Platform.OS === "android" && (
                <Text
                  style={[
                    styles.infoText,
                    { color: colors.accent, fontFamily: fontConfig.regular },
                  ]}
                >
                  💡 Download will let you choose where to save the file
                </Text>
              )}
            </View>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  section: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeIcon: {
    paddingLeft: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
  },
  buttonHalf: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 8,
  },
  fileInfo: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 16,
  },
});
