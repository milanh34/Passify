import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, ActivityIndicator, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "../../src/components/Toast";
import * as Sharing from "expo-sharing";
import { encryptData } from "../../src/utils/crypto";
import { calculateDimensions, packHeader, calculateChecksum, encodeToBlocks } from "../../src/utils/blocks";
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

  const showToastMessage = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEncode = async () => {
    if (!password.trim()) {
      showToastMessage("Please enter a password", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Serialize data
      const dataToEncrypt = JSON.stringify({ database, schemas });
      
      // 2. Encrypt
      const encryptedBytes = await encryptData(dataToEncrypt, password);
      
      // 3. Calculate dimensions
      const { width, height } = calculateDimensions(encryptedBytes.length);
      
      // 4. Create header
      const header = {
        magic: 0x504D4947,
        version: 1,
        width,
        height,
        dataLength: encryptedBytes.length,
        checksum: calculateChecksum(encryptedBytes),
      };
      
      const headerBytes = packHeader(header);
      
      // 5. Combine header + encrypted data
      const fullData = new Uint8Array(headerBytes.length + encryptedBytes.length);
      fullData.set(headerBytes);
      fullData.set(encryptedBytes, headerBytes.length);
      
      // 6. Encode to pixel blocks
      const pixels = encodeToBlocks(fullData, width, height);
      
      // 7. Save as PNG
      const timestamp = Date.now();
      const filename = `passify_backup_${timestamp}.png`;
      const uri = await savePixelsAsPNG(pixels, width, height, filename);
      
      setImageUri(uri);
      showToastMessage("Image generated successfully!");
      
    } catch (error: any) {
      console.error("Encoding error:", error);
      showToastMessage(`Encoding failed: ${error.message}`, "error");
    } finally {
      setLoading(false);
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
          Convert your account data into an encrypted image file.
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
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        {/* Encode Button */}
        <Pressable
          onPress={handleEncode}
          disabled={loading}
          style={[styles.button, { backgroundColor: colors.accent }]}
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
        {imageUri && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
              Generated Image
            </Text>
            <View style={[styles.imagePreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            
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
});
