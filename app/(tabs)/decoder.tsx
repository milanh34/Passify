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
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { useDb } from "../../src/context/DbContext";
import { Ionicons } from "@expo/vector-icons";
import Toast from "../../src/components/Toast";
import ProgressBar from "../../src/components/ProgressBar";
import * as DocumentPicker from "expo-document-picker";
import * as Clipboard from "expo-clipboard";
import { decryptData } from "../../src/utils/crypto";
import { unpackHeader, calculateChecksum, decodeFromPixels, BLOCK_CONSTANTS } from "../../src/utils/blocks";
import { loadPNGAsPixels } from "../../src/utils/image";
import { ThrottledProgress, ProgressUpdate } from "../../src/types/progress";
import { generateExportText, toTitleCase } from "../../src/utils/transferParser";

interface DecodedData {
  database: Record<string, any[]>;
  schemas: Record<string, string[]>;
}

export default function DecoderScreen() {
  const { colors, fontConfig } = useTheme();
  const { database, schemas, addPlatform, addAccount, updateAccount, updatePlatformSchema } = useDb();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [imageUri, setImageUri] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [decodedData, setDecodedData] = useState<DecodedData | null>(null);
  const [decodedText, setDecodedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  // Byte-accurate progress
  const [progressUpdate, setProgressUpdate] = useState<ProgressUpdate>({
    phase: 'readFile',
    processedBytes: 0,
    totalBytes: 0,
    percent: 0,
  });
  const [showProgress, setShowProgress] = useState(false);
  
  // Proper cleanup refs
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

  const cleanup = () => {
    isProcessingRef.current = false;
    progressCallbacksRef.current.clear();
    
    if (isMountedRef.current) {
      setLoading(false);
      setShowProgress(false);
      setProgressUpdate({
        phase: 'readFile',
        processedBytes: 0,
        totalBytes: 0,
        percent: 0,
      });
    }
  };

  const handleRefresh = async () => {
    if (isProcessingRef.current) {
      console.log('🛑 Cancelling ongoing decode...');
      cleanup();
    }
    
    setRefreshing(true);
    
    setImageUri("");
    setPassword("");
    setDecodedData(null);
    setDecodedText("");
    setLoading(false);
    setShowProgress(false);
    setProgressUpdate({
      phase: 'readFile',
      processedBytes: 0,
      totalBytes: 0,
      percent: 0,
    });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (isMountedRef.current) {
      setRefreshing(false);
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

    if (isProcessingRef.current) {
      showToastMessage("A process is already running", "error");
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    setShowProgress(true);
    
    const safeProgressUpdate = (update: ProgressUpdate) => {
      if (isMountedRef.current && isProcessingRef.current) {
        setProgressUpdate(update);
      }
    };
    
    progressCallbacksRef.current.add(safeProgressUpdate);
    
    try {
      // Stage 1: Read file and decode PNG
      if (!isProcessingRef.current) return;
      
      safeProgressUpdate({
        phase: 'readFile',
        processedBytes: 0,
        totalBytes: 100,
        percent: 0,
      });
      
      const { pixels, width, height } = await loadPNGAsPixels(imageUri, (phase, percent) => {
        if (isProcessingRef.current) {
          safeProgressUpdate({
            phase: phase === 'Reading file' ? 'readFile' : 'decodePNG',
            processedBytes: Math.round(percent),
            totalBytes: 100,
            percent,
          });
        }
      });
      
      // Stage 2: Decode header
      if (!isProcessingRef.current) return;
      
      const progress = new ThrottledProgress((update) => {
        if (isProcessingRef.current) {
          safeProgressUpdate(update);
        }
      });
      
      const headerBytes = decodeFromPixels(pixels, BLOCK_CONSTANTS.HEADER_SIZE, progress);
      const header = unpackHeader(headerBytes);
      
      // Validate dimensions
      if (header.width !== width || header.height !== height) {
        throw new Error("Image dimensions mismatch");
      }
      
      // Stage 3: Decode full data
      if (!isProcessingRef.current) return;
      
      const fullDataLength = BLOCK_CONSTANTS.HEADER_SIZE + header.dataLength;
      const fullData = decodeFromPixels(pixels, fullDataLength, progress);
      const encryptedData = fullData.slice(BLOCK_CONSTANTS.HEADER_SIZE);
      
      // Stage 4: Verify checksum
      if (!isProcessingRef.current) return;
      
      const checksum = calculateChecksum(encryptedData);
      if (checksum !== header.checksum) {
        throw new Error("Data integrity check failed: corrupted image");
      }
      
      // Stage 5: Decrypt
      if (!isProcessingRef.current) return;
      
      const decryptedJson = await decryptData(encryptedData, password, (update) => {
        if (isProcessingRef.current) {
          safeProgressUpdate(update);
        }
      });
      
      // Stage 6: Parse JSON
      if (!isProcessingRef.current) return;
      
      safeProgressUpdate({
        phase: 'parseJSON',
        processedBytes: 0,
        totalBytes: decryptedJson.length,
        percent: 0,
      });
      
      const parsed: DecodedData = JSON.parse(decryptedJson);
      
      safeProgressUpdate({
        phase: 'parseJSON',
        processedBytes: decryptedJson.length,
        totalBytes: decryptedJson.length,
        percent: 100,
      });
      
      if (!isProcessingRef.current) return;
      
      if (isMountedRef.current) {
        setDecodedData(parsed);
        setDecodedText(JSON.stringify(parsed, null, 2));
        
        safeProgressUpdate({
          phase: 'done',
          processedBytes: 100,
          totalBytes: 100,
          percent: 100,
        });
        
        showToastMessage("Successfully decoded!");
      }
      
    } catch (error: any) {
      if (isMountedRef.current && isProcessingRef.current) {
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
      }
      
      if (isMountedRef.current) {
        setDecodedData(null);
        setDecodedText("");
      }
    } finally {
      cleanup();
      
      setTimeout(() => {
        if (isMountedRef.current) {
          setShowProgress(false);
        }
      }, 1000);
    }
  };

  const handleImportToAccounts = async () => {
    if (!decodedData) return;
    
    setLoading(true);
    
    try {
      let importedCount = 0;
      let updatedCount = 0;
      
      // Process each platform
      for (const [platformId, accounts] of Object.entries(decodedData.database)) {
        const platformName = toTitleCase(platformId.replace(/_/g, ' '));
        
        // Add platform if it doesn't exist
        if (!database[platformId]) {
          addPlatform(platformId, platformName);
        }
        
        // Merge schemas
        const existingSchema = schemas[platformId] || [];
        const newSchema = decodedData.schemas[platformId] || [];
        const mergedSchema = Array.from(new Set([...existingSchema, ...newSchema]));
        
        if (mergedSchema.length > existingSchema.length) {
          updatePlatformSchema(platformId, mergedSchema);
        }
        
        // Import accounts
        for (const account of accounts) {
          const existingAccounts = database[platformId] || [];
          
          // Check for duplicate by email or username
          const identifierField = account.email ? 'email' : account.username ? 'username' : null;
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
      
      showToastMessage(
        `Import complete! ${importedCount} new, ${updatedCount} updated`,
        "success"
      );
      
      // Navigate to manage screen after 1 second
      setTimeout(() => {
        if (isMountedRef.current) {
          router.push('/(tabs)');
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Import error:", error);
      showToastMessage(`Import failed: ${error.message}`, "error");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleGetFormattedText = () => {
    if (!decodedData) return;
    
    // Generate formatted export text
    const formattedText = generateExportText(decodedData.database, decodedData.schemas);
    
    Alert.alert(
      "Formatted Export Text",
      "Text has been copied to clipboard",
      [
        {
          text: "View Text",
          onPress: () => {
            setDecodedText(formattedText);
          },
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]
    );
    
    Clipboard.setStringAsync(formattedText);
    showToastMessage("Formatted text copied!");
  };

  const handleCopyJSON = async () => {
    if (decodedText) {
      await Clipboard.setStringAsync(decodedText);
      showToastMessage("Copied to clipboard");
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
            📄 {imageUri.split('/').pop()}
          </Text>
        )}

        {/* Password Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
            Password
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
          <ProgressBar
            percent={progressUpdate.percent}
            phase={progressUpdate.phase}
            processedBytes={progressUpdate.processedBytes}
            totalBytes={progressUpdate.totalBytes}
            visible={showProgress}
          />
        )}

        {/* Decode Button */}
        <Pressable
          onPress={handleDecode}
          disabled={loading || !imageUri}
          style={[styles.button, { backgroundColor: colors.accent, opacity: (!imageUri || loading) ? 0.5 : 1 }]}
        >
          {loading && !decodedData ? (
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

        {/* Post-Decode Actions */}
        {decodedData && !loading && (
          <View style={styles.section}>
            <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.accent }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.accent} />
              <Text style={[styles.successText, { color: colors.text, fontFamily: fontConfig.bold }]}>
                Decoding Successful!
              </Text>
              <Text style={[styles.successSubtext, { color: colors.muted, fontFamily: fontConfig.regular }]}>
                {Object.keys(decodedData.database).length} platforms • {' '}
                {Object.values(decodedData.database).flat().length} accounts
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                onPress={handleImportToAccounts}
                disabled={loading}
                style={[styles.button, styles.primaryAction, { backgroundColor: colors.accent }]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={20} color="#fff" />
                    <Text style={[styles.buttonText, { fontFamily: fontConfig.bold }]}>
                      Import to Accounts
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleGetFormattedText}
                style={[styles.button, styles.secondaryAction, { 
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  borderWidth: 1,
                }]}
              >
                <Ionicons name="document-text" size={20} color={colors.text} />
                <Text style={[styles.buttonText, { color: colors.text, fontFamily: fontConfig.bold }]}>
                  Get Formatted Text
                </Text>
              </Pressable>
            </View>

            {/* JSON Preview */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text, fontFamily: fontConfig.regular }]}>
                  Decoded Data (JSON)
                </Text>
                <Pressable onPress={handleCopyJSON} style={styles.copyButton}>
                  <Ionicons name="copy-outline" size={18} color={colors.accent} />
                  <Text style={[styles.copyText, { color: colors.accent, fontFamily: fontConfig.regular }]}>
                    Copy
                  </Text>
                </Pressable>
              </View>
              
              <ScrollView
                style={[styles.outputBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                nestedScrollEnabled
              >
                <Text style={[styles.outputText, { color: colors.text, fontFamily: "monospace" }]}>
                  {decodedText}
                </Text>
              </ScrollView>
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
  successCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 20,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  primaryAction: {
    // Inherits button styles
  },
  secondaryAction: {
    // Inherits button styles
  },
  outputBox: {
    maxHeight: 300,
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
