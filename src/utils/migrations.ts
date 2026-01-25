// src/utils/migrations.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createEncryptedBackup,
  restoreFromBackup,
  deleteBackup,
  readEncryptedDatabase,
  readEncryptedSchemas,
  readEncryptedMetadata,
  writeAllEncryptedData,
} from "./encryptedStorage";
import { log } from "./logger";

export const CURRENT_DB_VERSION = 1;

const DB_VERSION_KEY = "@PM:db_version";
const MIGRATION_LOG_KEY = "@PM:migration_log";

export interface MigrationLog {
  version: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface DatabaseState {
  database: Record<string, any[]>;
  schemas: Record<string, string[]>;
  metadata: Record<string, any>;
}

export type MigrationFunction = (state: DatabaseState) => Promise<DatabaseState>;

const MIGRATIONS: Record<number, MigrationFunction> = {
  1: async (state: DatabaseState): Promise<DatabaseState> => {
    log.info("📦 Running migration to v1: Adding timestamps and normalizing data...");

    const now = Date.now();
    const { database, schemas, metadata } = state;
    const migratedDatabase: Record<string, any[]> = {};

    for (const [platformKey, accounts] of Object.entries(database)) {
      migratedDatabase[platformKey] = accounts.map((account: any, index: number) => ({
        ...account,
        id: account.id || `acc_${now}_${index}_${Math.floor(Math.random() * 9999)}`,
        createdAt: account.createdAt || now - Math.floor(Math.random() * 86400000 * 30),
        updatedAt: account.updatedAt || now,
      }));
    }

    const migratedMetadata: Record<string, any> = { ...metadata };

    for (const platformKey of Object.keys(migratedDatabase)) {
      if (!migratedMetadata[platformKey]) {
        migratedMetadata[platformKey] = {
          createdAt: now - Math.floor(Math.random() * 86400000 * 30),
          updatedAt: now,
          icon: null,
          iconColor: null,
        };
      }
    }

    const migratedSchemas: Record<string, string[]> = { ...schemas };

    for (const platformKey of Object.keys(migratedDatabase)) {
      if (!migratedSchemas[platformKey] || migratedSchemas[platformKey].length === 0) {
        const firstAccount = migratedDatabase[platformKey][0];
        if (firstAccount) {
          const inferredSchema = Object.keys(firstAccount).filter(
            (key) => !["id", "createdAt", "updatedAt"].includes(key)
          );
          migratedSchemas[platformKey] =
            inferredSchema.length > 0 ? inferredSchema : ["name", "password"];
        } else {
          migratedSchemas[platformKey] = ["name", "password"];
        }
      }
    }

    log.info("✅ Migration to v1 complete");

    return {
      database: migratedDatabase,
      schemas: migratedSchemas,
      metadata: migratedMetadata,
    };
  },

  // Example: Migration to version 2 (future)
  // 2: async (state: DatabaseState): Promise<DatabaseState> => {
  //   log.info("📦 Running migration to v2: Adding new feature...");
  //   // Add migration logic here
  //   return state;
  // },
};

export async function getDatabaseVersion(): Promise<number> {
  try {
    const version = await AsyncStorage.getItem(DB_VERSION_KEY);
    return version ? parseInt(version, 10) : 0;
  } catch (error) {
    log.error("❌ Failed to get database version:", error);
    return 0;
  }
}

async function setDatabaseVersion(version: number): Promise<void> {
  try {
    await AsyncStorage.setItem(DB_VERSION_KEY, version.toString());
  } catch (error) {
    log.error("❌ Failed to set database version:", error);
    throw error;
  }
}

async function logMigration(log_: MigrationLog): Promise<void> {
  try {
    const existingLogs = await AsyncStorage.getItem(MIGRATION_LOG_KEY);
    const logs: MigrationLog[] = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(log_);

    const trimmedLogs = logs.slice(-20);
    await AsyncStorage.setItem(MIGRATION_LOG_KEY, JSON.stringify(trimmedLogs));
  } catch (error) {
    log.error("❌ Failed to log migration:", error);
  }
}

export async function getMigrationLogs(): Promise<MigrationLog[]> {
  try {
    const logs = await AsyncStorage.getItem(MIGRATION_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    log.error("❌ Failed to get migration logs:", error);
    return [];
  }
}

export async function runMigrations(): Promise<{
  success: boolean;
  fromVersion: number;
  toVersion: number;
  error?: string;
}> {
  const currentVersion = await getDatabaseVersion();

  log.info(`📊 Current DB version: ${currentVersion}, Target version: ${CURRENT_DB_VERSION}`);

  if (currentVersion >= CURRENT_DB_VERSION) {
    log.info("✅ Database is up to date, no migrations needed");
    return {
      success: true,
      fromVersion: currentVersion,
      toVersion: currentVersion,
    };
  }

  let backupId: string | null = null;
  try {
    backupId = await createEncryptedBackup();
    log.info(`📦 Pre-migration backup created: ${backupId}`);
  } catch (error) {
    console.warn("⚠️ Could not create pre-migration backup, proceeding anyway...");
  }

  let state: DatabaseState;
  try {
    const [database, schemas, metadata] = await Promise.all([
      readEncryptedDatabase(),
      readEncryptedSchemas(),
      readEncryptedMetadata(),
    ]);
    state = { database, schemas, metadata };
  } catch (error) {
    log.info("📝 Starting with empty state (first run or corrupted data)");
    state = {
      database: {},
      schemas: {},
      metadata: {},
    };
  }

  let migratedState = state;
  let lastSuccessfulVersion = currentVersion;

  for (let version = currentVersion + 1; version <= CURRENT_DB_VERSION; version++) {
    const migrationFn = MIGRATIONS[version];

    if (!migrationFn) {
      console.warn(`⚠️ No migration function for version ${version}, skipping...`);
      continue;
    }

    log.info(`🔄 Running migration to version ${version}...`);

    try {
      migratedState = await migrationFn(migratedState);
      lastSuccessfulVersion = version;

      await logMigration({
        version,
        timestamp: Date.now(),
        success: true,
      });

      log.info(`✅ Migration to version ${version} successful`);
    } catch (error: any) {
      log.error(`❌ Migration to version ${version} failed:`, error);

      await logMigration({
        version,
        timestamp: Date.now(),
        success: false,
        error: error.message,
      });

      if (backupId) {
        log.info("🔄 Attempting rollback from backup...");
        const restored = await restoreFromBackup(backupId);
        if (restored) {
          log.info("✅ Rollback successful");
        } else {
          log.error("❌ Rollback failed!");
        }
      }

      return {
        success: false,
        fromVersion: currentVersion,
        toVersion: lastSuccessfulVersion,
        error: `Migration to v${version} failed: ${error.message}`,
      };
    }
  }

  try {
    await writeAllEncryptedData(
      migratedState.database,
      migratedState.schemas,
      migratedState.metadata
    );
    await setDatabaseVersion(CURRENT_DB_VERSION);

    if (backupId) {
      await deleteBackup(backupId);
      log.info("🗑️ Pre-migration backup cleaned up");
    }

    log.info(`✅ All migrations complete. DB now at version ${CURRENT_DB_VERSION}`);

    return {
      success: true,
      fromVersion: currentVersion,
      toVersion: CURRENT_DB_VERSION,
    };
  } catch (error: any) {
    log.error("❌ Failed to save migrated data:", error);

    if (backupId) {
      log.info("🔄 Attempting rollback from backup...");
      await restoreFromBackup(backupId);
    }

    return {
      success: false,
      fromVersion: currentVersion,
      toVersion: lastSuccessfulVersion,
      error: `Failed to save migrated data: ${error.message}`,
    };
  }
}

export async function needsMigration(): Promise<boolean> {
  const currentVersion = await getDatabaseVersion();
  return currentVersion < CURRENT_DB_VERSION;
}

export async function resetDatabaseVersion(): Promise<void> {
  await AsyncStorage.removeItem(DB_VERSION_KEY);
  await AsyncStorage.removeItem(MIGRATION_LOG_KEY);
  log.info("✅ Database version reset");
}
