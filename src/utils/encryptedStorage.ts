// src/utils/encryptedStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import aesjs from "aes-js";

const DEK_KEY = "Passify_database_encryption_key";
const DEK_IV_KEY = "Passify_database_encryption_iv";
const DB_ENCRYPTED_FLAG = "@PM:db_encrypted_flag";

const ENCRYPTED_DB_KEY = "@PM:encrypted_database";
const ENCRYPTED_SCHEMA_KEY = "@PM:encrypted_schemas";
const ENCRYPTED_METADATA_KEY = "@PM:encrypted_metadata";

const LEGACY_DB_KEY = "@PM:database";
const LEGACY_SCHEMA_KEY = "@PM:schemas";
const LEGACY_METADATA_KEY = "@PM:platform_metadata";

export interface EncryptedStorageStatus {
  isEncrypted: boolean;
  hasLegacyData: boolean;
  isInitialized: boolean;
}

async function generateRandomKey(): Promise<Uint8Array> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return new Uint8Array(randomBytes);
}

async function generateRandomIV(): Promise<Uint8Array> {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return new Uint8Array(randomBytes);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function getDatabaseEncryptionKey(): Promise<Uint8Array> {
  try {
    const existingKeyHex = await SecureStore.getItemAsync(DEK_KEY);

    if (existingKeyHex) {
      return hexToBytes(existingKeyHex);
    }

    console.log("🔐 Generating new database encryption key...");
    const newKey = await generateRandomKey();
    const newKeyHex = bytesToHex(newKey);

    await SecureStore.setItemAsync(DEK_KEY, newKeyHex, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    return newKey;
  } catch (error) {
    console.error("❌ Failed to get/create encryption key:", error);
    throw new Error("Failed to initialize database encryption");
  }
}

async function getOrCreateIV(forceNew: boolean = false): Promise<Uint8Array> {
  try {
    if (!forceNew) {
      const existingIVHex = await SecureStore.getItemAsync(DEK_IV_KEY);
      if (existingIVHex) {
        return hexToBytes(existingIVHex);
      }
    }

    const newIV = await generateRandomIV();
    const newIVHex = bytesToHex(newIV);

    await SecureStore.setItemAsync(DEK_IV_KEY, newIVHex, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    return newIV;
  } catch (error) {
    console.error("❌ Failed to get/create IV:", error);
    throw new Error("Failed to initialize encryption IV");
  }
}

async function encryptData(data: string): Promise<string> {
  try {
    const key = await getDatabaseEncryptionKey();
    const iv = await getOrCreateIV(true);

    const textBytes = aesjs.utils.utf8.toBytes(data);
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(Array.from(iv)));
    const encryptedBytes = aesCtr.encrypt(textBytes);

    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv);
    combined.set(encryptedBytes, iv.length);

    return bytesToHex(combined);
  } catch (error) {
    console.error("❌ Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

async function decryptData(encryptedHex: string): Promise<string> {
  try {
    const key = await getDatabaseEncryptionKey();
    const combined = hexToBytes(encryptedHex);

    const iv = combined.slice(0, 16);
    const ciphertext = combined.slice(16);

    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(Array.from(iv)));
    const decryptedBytes = aesCtr.decrypt(ciphertext);

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

export async function checkEncryptionStatus(): Promise<EncryptedStorageStatus> {
  try {
    const [encryptedFlag, legacyDb, encryptedDb] = await AsyncStorage.multiGet([
      DB_ENCRYPTED_FLAG,
      LEGACY_DB_KEY,
      ENCRYPTED_DB_KEY,
    ]);

    const isEncrypted = encryptedFlag[1] === "true";
    const hasLegacyData = legacyDb[1] !== null;
    const hasEncryptedData = encryptedDb[1] !== null;

    return {
      isEncrypted,
      hasLegacyData,
      isInitialized: hasEncryptedData || hasLegacyData,
    };
  } catch (error) {
    console.error("❌ Failed to check encryption status:", error);
    return {
      isEncrypted: false,
      hasLegacyData: false,
      isInitialized: false,
    };
  }
}

export async function migrateLegacyToEncrypted(): Promise<boolean> {
  console.log("🔄 Starting legacy data migration to encrypted storage...");

  try {
    const [legacyDb, legacySchema, legacyMetadata] = await AsyncStorage.multiGet([
      LEGACY_DB_KEY,
      LEGACY_SCHEMA_KEY,
      LEGACY_METADATA_KEY,
    ]);

    const database = legacyDb[1] ? JSON.parse(legacyDb[1]) : {};
    const schemas = legacySchema[1] ? JSON.parse(legacySchema[1]) : {};
    const metadata = legacyMetadata[1] ? JSON.parse(legacyMetadata[1]) : {};

    await writeEncryptedDatabase(database);
    await writeEncryptedSchemas(schemas);
    await writeEncryptedMetadata(metadata);

    await AsyncStorage.setItem(DB_ENCRYPTED_FLAG, "true");

    await AsyncStorage.multiRemove([LEGACY_DB_KEY, LEGACY_SCHEMA_KEY, LEGACY_METADATA_KEY]);

    console.log("✅ Legacy data migration completed successfully");
    return true;
  } catch (error) {
    console.error("❌ Legacy data migration failed:", error);
    return false;
  }
}

export async function readEncryptedDatabase(): Promise<Record<string, any[]>> {
  try {
    const encrypted = await AsyncStorage.getItem(ENCRYPTED_DB_KEY);

    if (!encrypted) {
      return {};
    }

    const decrypted = await decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("❌ Failed to read encrypted database:", error);
    throw new Error("Failed to read database. Data may be corrupted.");
  }
}

export async function writeEncryptedDatabase(data: Record<string, any[]>): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = await encryptData(jsonString);
    await AsyncStorage.setItem(ENCRYPTED_DB_KEY, encrypted);
  } catch (error) {
    console.error("❌ Failed to write encrypted database:", error);
    throw new Error("Failed to save database");
  }
}

export async function readEncryptedSchemas(): Promise<Record<string, string[]>> {
  try {
    const encrypted = await AsyncStorage.getItem(ENCRYPTED_SCHEMA_KEY);

    if (!encrypted) {
      return {};
    }

    const decrypted = await decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("❌ Failed to read encrypted schemas:", error);
    throw new Error("Failed to read schemas. Data may be corrupted.");
  }
}

export async function writeEncryptedSchemas(data: Record<string, string[]>): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = await encryptData(jsonString);
    await AsyncStorage.setItem(ENCRYPTED_SCHEMA_KEY, encrypted);
  } catch (error) {
    console.error("❌ Failed to write encrypted schemas:", error);
    throw new Error("Failed to save schemas");
  }
}

export async function readEncryptedMetadata(): Promise<Record<string, any>> {
  try {
    const encrypted = await AsyncStorage.getItem(ENCRYPTED_METADATA_KEY);

    if (!encrypted) {
      return {};
    }

    const decrypted = await decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("❌ Failed to read encrypted metadata:", error);
    throw new Error("Failed to read metadata. Data may be corrupted.");
  }
}

export async function writeEncryptedMetadata(data: Record<string, any>): Promise<void> {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = await encryptData(jsonString);
    await AsyncStorage.setItem(ENCRYPTED_METADATA_KEY, encrypted);
  } catch (error) {
    console.error("❌ Failed to write encrypted metadata:", error);
    throw new Error("Failed to save metadata");
  }
}

export async function writeAllEncryptedData(
  database: Record<string, any[]>,
  schemas: Record<string, string[]>,
  metadata: Record<string, any>
): Promise<void> {
  try {
    const [encryptedDb, encryptedSchemas, encryptedMetadata] = await Promise.all([
      encryptData(JSON.stringify(database)),
      encryptData(JSON.stringify(schemas)),
      encryptData(JSON.stringify(metadata)),
    ]);

    await AsyncStorage.multiSet([
      [ENCRYPTED_DB_KEY, encryptedDb],
      [ENCRYPTED_SCHEMA_KEY, encryptedSchemas],
      [ENCRYPTED_METADATA_KEY, encryptedMetadata],
      [DB_ENCRYPTED_FLAG, "true"],
    ]);
  } catch (error) {
    console.error("❌ Failed to write all encrypted data:", error);
    throw new Error("Failed to save data");
  }
}

export async function createEncryptedBackup(): Promise<string> {
  const backupId = `backup_${Date.now()}`;

  try {
    const [db, schema, metadata] = await AsyncStorage.multiGet([
      ENCRYPTED_DB_KEY,
      ENCRYPTED_SCHEMA_KEY,
      ENCRYPTED_METADATA_KEY,
    ]);

    const backupData = {
      database: db[1],
      schemas: schema[1],
      metadata: metadata[1],
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(`@PM:backup:${backupId}`, JSON.stringify(backupData));

    console.log(`✅ Backup created: ${backupId}`);
    return backupId;
  } catch (error) {
    console.error("❌ Failed to create backup:", error);
    throw new Error("Failed to create backup");
  }
}

export async function restoreFromBackup(backupId: string): Promise<boolean> {
  try {
    const backupData = await AsyncStorage.getItem(`@PM:backup:${backupId}`);

    if (!backupData) {
      console.error("❌ Backup not found:", backupId);
      return false;
    }

    const { database, schemas, metadata } = JSON.parse(backupData);

    await AsyncStorage.multiSet([
      [ENCRYPTED_DB_KEY, database],
      [ENCRYPTED_SCHEMA_KEY, schemas],
      [ENCRYPTED_METADATA_KEY, metadata],
    ]);

    console.log(`✅ Restored from backup: ${backupId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to restore from backup:", error);
    return false;
  }
}

export async function deleteBackup(backupId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`@PM:backup:${backupId}`);
    console.log(`✅ Backup deleted: ${backupId}`);
  } catch (error) {
    console.error("❌ Failed to delete backup:", error);
  }
}

export async function clearAllEncryptedData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      ENCRYPTED_DB_KEY,
      ENCRYPTED_SCHEMA_KEY,
      ENCRYPTED_METADATA_KEY,
      DB_ENCRYPTED_FLAG,
    ]);

    await SecureStore.deleteItemAsync(DEK_KEY);
    await SecureStore.deleteItemAsync(DEK_IV_KEY);

    console.log("✅ All encrypted data cleared");
  } catch (error) {
    console.error("❌ Failed to clear encrypted data:", error);
  }
}
