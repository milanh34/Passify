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
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "../../src/components/Toast";
import ProgressBar from "../../src/components/ProgressBar";
import { shareImage, downloadImage } from "../../src/utils/fileSharing";
import { encryptData } from "../../src/utils/crypto";
import { calculateDimensions, packHeader, calculateChecksum, encodeToPixels, BLOCK_CONSTANTS } from "../../src/utils/blocks";
import { savePixelsAsPNG } from "../../src/utils/image";
import { encodePNG } from "../../src/utils/pngEncoder";
import { ThrottledProgress, ProgressUpdate } from "../../src/types/progress";

export default function EncoderScreen() {
  const { colors, fontConfig } = useTheme();
  const { database, schemas } = useDb();
  const insets = useSafeAreaInsets();
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  // Byte-accurate progress
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate>({
    phase: 'stringify',
    processedBytes: 0,
    totalBytes: 0,
    percent: 0,
  });
  const [showProgress, setShowProgress] = useState(false);
  
  // FIX: Use ref to track if component is mounted and processing
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);
  const progressCallbacksRef = useRef<Set<Function>>(new Set());

  // FIX: Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;
      progressCallbacksRef.current.clear();
    };
  }, []);

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
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

  // FIX: Proper cleanup function
  const cleanup = () => {
    isProcessingRef.current = false;
    progressCallbacksRef.current.clear();
    
    if (isMountedRef.current) {
      setLoading(false);
      setShowProgress(false);
      setProgressUpdate({
        phase: 'stringify',
        processedBytes: 0,
        totalBytes: 0,
        percent: 0,
      });
    }
  };

  const handleRefresh = async () => {
    // FIX: Stop all ongoing processes
    if (isProcessingRef.current) {
      console.log('🛑 Cancelling ongoing process...');
      cleanup();
    }
    
    setRefreshing(true);
    
    // Reset all state
    setPassword("");
    setImageUri("");
    setLoading(false);
    setShowProgress(false);
    setProgressUpdate({
      phase: 'stringify',
      processedBytes: 0,
      totalBytes: 0,
      percent: 0,
    });
    
    // Give time for state to settle
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (isMountedRef.current) {
      setRefreshing(false);
    }
  };

  const handleEncode = async () => {
    if (!password.trim()) {
      showToastMessage("Please enter a password", "error");
      return;
    }

    // FIX: Prevent multiple simultaneous processes
    if (isProcessingRef.current) {
      showToastMessage("A process is already running", "error");
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    setShowProgress(true);
    
    // FIX: Create safe progress callback that checks if still processing
    const safeProgressUpdate = (update: ProgressUpdate) => {
      if (isMountedRef.current && isProcessingRef.current) {
        setProgressUpdate(update);
      }
    };
    
    progressCallbacksRef.current.add(safeProgressUpdate);
    
    try {
      // Check if still processing before each stage
      if (!isProcessingRef.current) {
        console.log('Process cancelled at start');
        return;
      }

      // Stage 1: Stringify
      const dataToEncrypt = JSON.stringify({ database, schemas });
      const stringifyBytes = new TextEncoder().encode(dataToEncrypt).length;
      
      if (!isProcessingRef.current) return;
      safeProgressUpdate({
        phase: 'stringify',
        processedBytes: stringifyBytes,
        totalBytes: stringifyBytes,
        percent: 100,
      });
      
      // Stage 2: Encrypt
      if (!isProcessingRef.current) return;
      const encryptedBytes = await encryptData(dataToEncrypt, password, (update) => {
        if (isProcessingRef.current) {
          safeProgressUpdate(update);
        }
      });
      
      // Stage 3: Calculate dimensions
      if (!isProcessingRef.current) return;
      const { width, height } = calculateDimensions(encryptedBytes.length);
      
      // Stage 4: Create header
      if (!isProcessingRef.current) return;
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
      
      // Stage 5: Combine data
      if (!isProcessingRef.current) return;
      const fullData = new Uint8Array(headerBytes.length + encryptedBytes.length);
      fullData.set(headerBytes);
      fullData.set(encryptedBytes, headerBytes.length);
      
      // Stage 6: Encode to pixels
      if (!isProcessingRef.current) return;
      const progress = new ThrottledProgress((update) => {
        if (isProcessingRef.current) {
          safeProgressUpdate(update);
        }
      });
      const pixels = encodeToPixels(fullData, width, height, progress);
      
      // Stage 7: Encode PNG
      if (!isProcessingRef.current) return;
      const pngBytes = await encodePNG(pixels, width, height, (phase, percent) => {
        if (isProcessingRef.current) {
          safeProgressUpdate({
            phase: 'encodePNG',
            processedBytes: Math.round((percent / 100) * pixels.length),
            totalBytes: pixels.length,
            percent,
          });
        }
      });
      
      // Stage 8: Write file
      if (!isProcessingRef.current) return;
      const timestamp = Date.now();
      const filename = `passify_backup_${timestamp}.png`;
      
      safeProgressUpdate({
        phase: 'writeFile',
        processedBytes: 0,
        totalBytes: pngBytes.length,
        percent: 0,
      });
      
      const uri = await savePixelsAsPNG(pixels, width, height, filename, (phase, percent) => {
        if (isProcessingRef.current) {
          safeProgressUpdate({
            phase: 'writeFile',
            processedBytes: Math.round((percent / 100) * pngBytes.length),
            totalBytes: pngBytes.length,
            percent,
          });
        }
      });
      
      // Only update UI if still processing
      if (!isProcessingRef.current) return;
      
      if (isMountedRef.current) {
        setImageUri(uri);
        safeProgressUpdate({
          phase: 'done',
          processedBytes: pngBytes.length,
          totalBytes: pngBytes.length,
          percent: 100,
        });
        showToastMessage("Image generated successfully!");
      }
      
    } catch (error: any) {
      if (isMountedRef.current && isProcessingRef.current) {
        console.error("Encoding error:", error);
        showToastMessage(`Encoding failed: ${error.message}`, "error");
      }
    } finally {
      cleanup();
      
      // Hide progress after delay
      setTimeout(() => {
        if (isMountedRef.current) {
          setShowProgress(false);
        }
      }, 1000);
    }
  };

  const handleShare = async () => {
    if (!imageUri) return;
    const success = await shareImage(imageUri);
    if (success) {
      showToastMessage("Shared successfully!");
    } else {
      showToastMessage("Share failed", "error");
    }
  };

  const handleDownload = async () => {
    if (!imageUri) return;
    const filename = imageUri.split('/').pop() || 'passify_backup.png';
    const success = await downloadImage(imageUri, filename);
    if (success) {
      showToastMessage("Download started");
    } else {
      showToastMessage("Download failed", "error");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg[0] }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
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
        
        <Text style={[styles.description, { color: colors.muted, fontFamily: fontConfig.regular }]}>
          Convert your account data into a colorful encrypted image using 1×1 RGBA encoding.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
            Password
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: fontConfig.regular }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter encryption password"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
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
          disabled={loading}
          style={[styles.button, { backgroundColor: colors.accent, opacity: loading ? 0.7 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="image" size={20} color="#fff" />
              <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
                Generate Image
              </Text>
            </>
          )}
        </Pressable>

        {imageUri && !loading && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
              Generated Colored Image
            </Text>
            <View style={[styles.imagePreview, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            
            <Text style={[styles.info, { color: colors.muted, fontFamily: fontConfig.regular }]}>
              This colorful image contains your encrypted data using RGBA channel encoding (4 bytes per pixel).
            </Text>
            
            <View style={styles.buttonRow}>
              <Pressable
                onPress={handleShare}
                style={[styles.button, styles.halfButton, { backgroundColor: colors.accent2 }]}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
                  Share
                </Text>
              </Pressable>
              
              <Pressable
                onPress={handleDownload}
                style={[styles.button, styles.halfButton, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
                  Download
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

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
    gap: 24,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  imagePreview: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
