import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, ActivityIndicator, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "../../src/components/Toast";
import ProgressBar from "../../src/components/ProgressBar";
import * as Sharing from "expo-sharing";
import { encryptData } from "../../src/utils/crypto";
import { calculateDimensions, packHeader, calculateChecksum, encodeToPixels, BLOCK_CONSTANTS } from "../../src/utils/blocks";
import { savePixelsAsPNG } from "../../src/utils/image";

export default function EncoderScreen() {
  const { colors, fontConfig } = useTheme();
  const { database, schemas } = useDb();
  const insets = useSafeAreaInsets();
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imageUri, setImageUri] = useState("");
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

  const handleEncode = async () => {
    if (!password.trim()) {
      showToastMessage("Please enter a password", "error");
      return;
    }

    setLoading(true);
    setShowProgress(true);
    setProgress(0);
    
    try {
      // Stage 1: Stringify (5%)
      updateProgress('Serializing data', 0);
      const dataToEncrypt = JSON.stringify({ database, schemas });
      updateProgress('Serializing data', 100);
      
      // Stage 2-4: Encrypt (40% total: 15% key + 25% encrypt)
      const encryptedBytes = await encryptData(dataToEncrypt, password, (stage, percent) => {
        if (stage.includes('key')) {
          updateProgress(stage, percent * 0.375); // Map to 0-15%
        } else if (stage.includes('Encrypt')) {
          updateProgress(stage, 15 + (percent * 0.625)); // Map to 15-40%
        } else {
          updateProgress(stage, 40);
        }
      });
      
      // Stage 5: Calculate dimensions
      updateProgress('Calculating image size', 0);
      const { width, height } = calculateDimensions(encryptedBytes.length);
      updateProgress('Calculating image size', 100);
      
      // Stage 6: Create header
      updateProgress('Creating header', 0);
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
      updateProgress('Creating header', 100);
      
      // Stage 7: Combine data
      const fullData = new Uint8Array(headerBytes.length + encryptedBytes.length);
      fullData.set(headerBytes);
      fullData.set(encryptedBytes, headerBytes.length);
      
      // Stage 8: Encode to pixels (20%)
      const pixels = encodeToPixels(fullData, width, height, (stage, percent) => {
        updateProgress(stage, percent);
      });
      
      // Stage 9: Save as PNG (30%: 20% encode + 10% write)
      const timestamp = Date.now();
      const filename = `passify_backup_${timestamp}.png`;
      const uri = await savePixelsAsPNG(pixels, width, height, filename, (stage, percent) => {
        updateProgress(stage, percent);
      });
      
      setImageUri(uri);
      updateProgress('Complete', 100);
      showToastMessage("Image generated successfully!");
      
    } catch (error: any) {
      console.error("Encoding error:", error);
      showToastMessage(`Encoding failed: ${error.message}`, "error");
    } finally {
      setLoading(false);
      setTimeout(() => setShowProgress(false), 1000);
    }
  };

  const handleShare = async () => {
    if (!imageUri) return;
    
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(imageUri, {
          mimeType: "image/png",
          dialogTitle: "Share Encrypted Backup",
        });
      } else {
        showToastMessage("Sharing not available", "error");
      }
    } catch (error: any) {
      showToastMessage(`Share failed: ${error.message}`, "error");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text, fontFamily: fontConfig.bold }]}>
          Encode to Image
        </Text>
        
        <Text style={[styles.description, { color: colors.muted, fontFamily: fontConfig.regular }]}>
          Convert your account data into a colorful encrypted image using 1×1 RGBA encoding.
        </Text>

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

        {/* Progress Bar */}
        {showProgress && (
          <ProgressBar progress={progress} stage={currentStage} visible={showProgress} />
        )}

        {/* Encode Button */}
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

        {/* Image Preview */}
        {imageUri && !loading && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
              Generated Colored Image
            </Text>
            <View style={[styles.imagePreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            
            <Text style={[styles.info, { color: colors.muted, fontFamily: fontConfig.regular }]}>
              This colorful image contains your encrypted data using RGBA channel encoding (4 bytes per pixel).
            </Text>
            
            <Pressable
              onPress={handleShare}
              style={[styles.button, { backgroundColor: colors.accent2 }]}
            >
              <Ionicons name="share-outline" size={20} color="#fff" />
              <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
                Share Image
              </Text>
            </Pressable>
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
