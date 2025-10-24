import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "../../src/components/Toast";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { decryptData } from "../../src/utils/crypto";
import { unpackHeader, calculateChecksum, decodeFromBlocks } from "../../src/utils/blocks";
import { loadPNGAsPixels } from "../../src/utils/image";
import { TextInput } from "react-native";

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

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
    try {
      // 1. Load PNG and extract pixels
      const { pixels, width, height } = await loadPNGAsPixels(imageUri);
      
      // 2. Decode header first (24 bytes)
      const headerBytes = decodeFromBlocks(pixels, width, height, 24);
      const header = unpackHeader(headerBytes);
      
      // 3. Validate dimensions
      if (header.width !== width || header.height !== height) {
        throw new Error("Image dimensions mismatch");
      }
      
      // 4. Decode full data (header + encrypted)
      const fullDataLength = 24 + header.dataLength;
      const fullData = decodeFromBlocks(pixels, width, height, fullDataLength);
      const encryptedData = fullData.slice(24);
      
      // 5. Verify checksum
      const checksum = calculateChecksum(encryptedData);
      if (checksum !== header.checksum) {
        throw new Error("Data integrity check failed: corrupted image");
      }
      
      // 6. Decrypt
      const decryptedJson = await decryptData(encryptedData, password);
      
      // 7. Parse and validate JSON
      const parsed = JSON.parse(decryptedJson);
      
      setDecodedText(JSON.stringify(parsed, null, 2));
      showToastMessage("Successfully decoded!");
      
    } catch (error: any) {
      console.error("Decoding error:", error);
      
      if (error.message.includes("Authentication failed")) {
        showToastMessage("Wrong password", "error");
      } else if (error.message.includes("Invalid magic number")) {
        showToastMessage("Not a valid Passify backup image", "error");
      } else {
        showToastMessage(`Decoding failed: ${error.message}`, "error");
      }
      
      setDecodedText("");
    } finally {
      setLoading(false);
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
          Recover your account data from an encrypted image file.
        </Text>

        {/* Pick Image Button */}
        <Pressable onPress={handlePickImage} style={[styles.button, { backgroundColor: colors.accent2 }]}>
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
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.muted} />
            </Pressable>
          </View>
        </View>

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
        {decodedText && (
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
