import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "../../src/components/Toast";
import ProgressBar from "../../src/components/ProgressBar";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { decryptData } from "../../src/utils/crypto";
import { unpackHeader, calculateChecksum, decodeFromPixels, BLOCK_CONSTANTS } from "../../src/utils/blocks";
import { loadPNGAsPixels } from "../../src/utils/image";

export default function DecoderScreen() {
  const { colors, fontConfig } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [imageUri, setImageUri] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [decodedText, setDecodedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  // Progress tracking
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");
  const [showProgress, setShowProgress] = useState(false);

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  const updateProgress = (stage: string, percent: number) => {
    setCurrentStage(stage);
    setProgress(percent);
  };

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/png",
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        showToastMessage("Image loaded");
      }
    } catch (error: any) {
      showToastMessage(`Failed to pick image: ${error.message}`, "error");
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

    setLoading(true);
    setShowProgress(true);
    setProgress(0);
    
    try {
      // Stage 1: Load PNG (10%)
      const { pixels, width, height } = await loadPNGAsPixels(imageUri, (stage, percent) => {
        updateProgress(stage, percent);
      });
      
      // Stage 2: Decode header (5%)
      updateProgress('Validating header', 0);
      const headerBytes = decodeFromPixels(pixels, BLOCK_CONSTANTS.HEADER_SIZE);
      const header = unpackHeader(headerBytes);
      updateProgress('Validating header', 100);
      
      // Stage 3: Validate dimensions
      updateProgress('Validating image', 0);
      if (header.width !== width || header.height !== height) {
        throw new Error("Image dimensions mismatch");
      }
      updateProgress('Validating image', 100);
      
      // Stage 4: Decode full data (20%)
      const fullDataLength = BLOCK_CONSTANTS.HEADER_SIZE + header.dataLength;
      const fullData = decodeFromPixels(pixels, fullDataLength, (stage, percent) => {
        updateProgress(stage, percent);
      });
      const encryptedData = fullData.slice(BLOCK_CONSTANTS.HEADER_SIZE);
      
      // Stage 5: Verify checksum (5%)
      updateProgress('Verifying integrity', 0);
      const checksum = calculateChecksum(encryptedData);
      if (checksum !== header.checksum) {
        throw new Error("Data integrity check failed: corrupted image");
      }
      updateProgress('Verifying integrity', 100);
      
      // Stage 6-8: Decrypt (60% total: 15% key + 5% verify + 40% decrypt)
      const decryptedJson = await decryptData(encryptedData, password, (stage, percent) => {
        if (stage.includes('key')) {
          updateProgress(stage, percent * 0.25);
        } else if (stage.includes('auth')) {
          updateProgress(stage, 25 + (percent * 0.0833));
        } else if (stage.includes('Decrypt')) {
          updateProgress(stage, 30 + (percent * 0.6667));
        }
      });
      
      // Stage 9: Parse JSON
      updateProgress('Parsing data', 0);
      const parsed = JSON.parse(decryptedJson);
      updateProgress('Parsing data', 100);
      
      setDecodedText(JSON.stringify(parsed, null, 2));
      updateProgress('Complete', 100);
      showToastMessage("Successfully decoded!");
      
    } catch (error: any) {
      console.error("Decoding error:", error);
      
      if (error.message.includes("Authentication failed")) {
        showToastMessage("Wrong password", "error");
      } else if (error.message.includes("Invalid magic number")) {
        showToastMessage("Not a valid Passify backup image", "error");
      } else if (error.message.includes("Unsupported version")) {
        showToastMessage("Incompatible image version", "error");
      } else {
        showToastMessage(`Decoding failed: ${error.message}`, "error");
      }
      
      setDecodedText("");
    } finally {
      setLoading(false);
      setTimeout(() => setShowProgress(false), 1000);
    }
  };

  const handleCopy = async () => {
    if (decodedText) {
      await Clipboard.setStringAsync(decodedText);
      showToastMessage("Copied to clipboard");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
          Decode from Image
        </Text>
        
        <Text style={[styles.description, { color: colors.muted, fontFamily: fontConfig.regular }]}>
          Recover your account data from a colored encrypted image.
        </Text>

        {/* Pick Image Button */}
        <Pressable
          onPress={handlePickImage}
          disabled={loading}
          style={[styles.button, { backgroundColor: colors.accent2, opacity: loading ? 0.7 : 1 }]}
        >
          <Ionicons name="folder-open" size={20} color="#fff" />
          <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
            {imageUri ? "Change Image" : "Select Image"}
          </Text>
        </Pressable>

        {imageUri && (
          <Text style={[styles.fileInfo, { color: colors.muted, fontFamily: fontConfig.regular }]}>
            {imageUri.split('/').pop()}
          </Text>
        )}

        {/* Password Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
            Password
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: fontConfig.regular }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter decryption password"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Progress Bar */}
        {showProgress && (
          <ProgressBar progress={progress} stage={currentStage} visible={showProgress} />
        )}

        {/* Decode Button */}
        <Pressable
          onPress={handleDecode}
          disabled={loading || !imageUri}
          style={[styles.button, { backgroundColor: colors.accent, opacity: (!imageUri || loading) ? 0.5 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-open" size={20} color="#fff" />
              <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
                Decode Image
              </Text>
            </>
          )}
        </Pressable>

        {/* Decoded Output */}
        {decodedText && !loading && (
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
                Decoded Data
              </Text>
              <Pressable onPress={handleCopy} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={18} color={colors.accent} />
                <Text style={[styles.copyText, { color: colors.accent, fontFamily: fontConfig.regular }]}>
                  Copy
                </Text>
              </Pressable>
            </View>
            
            <ScrollView
              style={[styles.outputBox, { backgroundColor: colors.card, borderColor: colors.border }]}
              nestedScrollEnabled
            >
              <Text style={[styles.outputText, { color: colors.text, fontFamily: "monospace" }]}>
                {decodedText}
              </Text>
            </ScrollView>
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  fileInfo: {
    fontSize: 14,
    fontStyle: "italic",
  },
  outputBox: {
    maxHeight: 400,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  outputText: {
    fontSize: 14,
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  copyText: {
    fontSize: 14,
  },
});
