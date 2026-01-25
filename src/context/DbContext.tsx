// src/context/DbContext.tsx

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  checkEncryptionStatus,
  migrateLegacyToEncrypted,
  readEncryptedDatabase,
  readEncryptedSchemas,
  readEncryptedMetadata,
  writeEncryptedDatabase,
  writeEncryptedSchemas,
  writeEncryptedMetadata,
  writeAllEncryptedData,
} from "../utils/encryptedStorage";
import {
  runMigrations,
  getDatabaseVersion,
  CURRENT_DB_VERSION,
  needsMigration,
} from "../utils/migrations";
import { log } from "../utils/logger";

const initialData = require("../../assets/database.json");

type Account = {
  id: string;
  name: string;
  createdAt?: number;
  updatedAt?: number;
  [k: string]: any;
};
type Database = Record<string, Account[]>;
type Schemas = Record<string, string[]>;

type PlatformMetadata = {
  createdAt: number;
  updatedAt: number;
  icon?: string | null;
  iconColor?: string | null;
  displayField?: string | null;
};
type PlatformsMetadata = Record<string, PlatformMetadata>;

const defaultSchemas: Schemas = {
  google: ["name", "email", "password"],
  instagram: ["name", "username", "password"],
  github: ["name", "username", "email", "password"],
};

interface DbContextType {
  database: Database;
  schemas: Schemas;
  platformsMetadata: PlatformsMetadata;
  isDbLoading: boolean;
  dbError: string | null;
  dbVersion: number;
  addPlatform: (key: string, displayName?: string) => void;
  updatePlatformName: (oldKey: string, newName: string) => void;
  updatePlatformIcon: (platformKey: string, icon: string | null, iconColor?: string | null) => void;
  updatePlatformDisplayField: (platformKey: string, displayField: string | null) => void;
  deletePlatform: (key: string) => void;
  addAccount: (
    platformKey: string,
    payload: Omit<Account, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateAccount: (platformKey: string, id: string, updated: Account) => void;
  deleteAccount: (platformKey: string, id: string) => void;
  updatePlatformSchema: (platformKey: string, newSchema: string[]) => void;
  refreshDatabase: () => Promise<void>;
}

const Ctx = createContext<DbContextType | null>(null);

function useDebouncedSave() {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback(
    async (
      database: Database,
      schemas: Schemas,
      metadata: PlatformsMetadata,
      delay: number = 500
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise<void>((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            await writeAllEncryptedData(database, schemas, metadata);
            log.info("💾 Database saved (encrypted)");
            resolve();
          } catch (error) {
            log.error("❌ Failed to save database:", error);
            resolve();
          }
        }, delay);
      });
    },
    []
  );

  return debouncedSave;
}

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [database, setDatabase] = useState<Database>({});
  const [schemas, setSchemas] = useState<Schemas>({});
  const [platformsMetadata, setPlatformsMetadata] = useState<PlatformsMetadata>({});
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbVersion, setDbVersion] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const debouncedSave = useDebouncedSave();

  useEffect(() => {
    initializeDatabase();
  }, []);

  useEffect(() => {
    if (isInitialized && !isDbLoading) {
      debouncedSave(database, schemas, platformsMetadata);
    }
  }, [database, schemas, platformsMetadata, isInitialized, isDbLoading, debouncedSave]);

  const initializeDatabase = async () => {
    log.info("🔐 Initializing encrypted database...");
    setIsDbLoading(true);
    setDbError(null);

    try {
      const status = await checkEncryptionStatus();
      log.info("📊 Encryption status:", status);

      if (status.hasLegacyData && !status.isEncrypted) {
        log.info("🔄 Migrating legacy unencrypted data...");
        const migrated = await migrateLegacyToEncrypted();
        if (!migrated) {
          throw new Error("Failed to migrate legacy data to encrypted storage");
        }
      }

      if (await needsMigration()) {
        log.info("🔄 Running database migrations...");
        const migrationResult = await runMigrations();
        if (!migrationResult.success) {
          log.error("⚠️ Migration warning:", migrationResult.error);
        }
      }

      let dbVal: Database;
      let scVal: Schemas;
      let metaVal: PlatformsMetadata;

      try {
        [dbVal, scVal, metaVal] = await Promise.all([
          readEncryptedDatabase(),
          readEncryptedSchemas(),
          readEncryptedMetadata(),
        ]);
      } catch (readError) {
        log.warn("⚠️ Could not read encrypted data, using defaults:", readError);
        dbVal = {};
        scVal = {};
        metaVal = {};
      }

      if (Object.keys(dbVal).length === 0) {
        log.info("📝 Empty database, loading initial data...");
        dbVal = initialData;
        scVal = defaultSchemas;
      }

      const now = Date.now();
      const { findBestMatchingIcon } = require("../utils/iconLibrary");

      const updatedMeta = { ...metaVal };
      let needsMetaUpdate = false;

      Object.keys(dbVal).forEach((key) => {
        if (!updatedMeta[key]) {
          const accounts = dbVal[key] || [];
          const platformName =
            accounts.length > 0 && accounts[0].platform
              ? accounts[0].platform
              : key.replace(/_/g, " ");

          const iconMatch = findBestMatchingIcon(platformName);

          updatedMeta[key] = {
            createdAt: now - Math.floor(Math.random() * 86400000 * 30),
            updatedAt: now,
            icon: iconMatch?.platform || null,
            iconColor: iconMatch?.defaultColor || null,
          };
          needsMetaUpdate = true;
        } else if (updatedMeta[key].icon === undefined) {
          const accounts = dbVal[key] || [];
          const platformName =
            accounts.length > 0 && accounts[0].platform
              ? accounts[0].platform
              : key.replace(/_/g, " ");

          const iconMatch = findBestMatchingIcon(platformName);

          updatedMeta[key] = {
            ...updatedMeta[key],
            icon: iconMatch?.platform || null,
            iconColor: iconMatch?.defaultColor || null,
          };
          needsMetaUpdate = true;
        }
      });

      let needsDbUpdate = false;
      Object.keys(dbVal).forEach((platformKey) => {
        const accounts = dbVal[platformKey] || [];
        dbVal[platformKey] = accounts.map((acc: any) => {
          if (!acc.createdAt || !acc.updatedAt) {
            needsDbUpdate = true;
            return {
              ...acc,
              createdAt: acc.createdAt || now - Math.floor(Math.random() * 86400000 * 60),
              updatedAt: acc.updatedAt || now - Math.floor(Math.random() * 86400000 * 30),
            };
          }
          return acc;
        });
      });

      Object.keys(dbVal).forEach((key) => {
        if (!scVal[key]) {
          scVal[key] = ["name", "password"];
        }
      });

      setDatabase(dbVal);
      setSchemas(scVal);
      setPlatformsMetadata(updatedMeta);
      setDbVersion(await getDatabaseVersion());

      if (needsMetaUpdate || needsDbUpdate) {
        await writeAllEncryptedData(dbVal, scVal, updatedMeta);
        log.info("💾 Updated database saved");
      }

      log.info("✅ Database initialized successfully");
    } catch (error: any) {
      log.error("❌ Database initialization failed:", error);
      setDbError(error.message || "Failed to initialize database");

      setDatabase({});
      setSchemas({});
      setPlatformsMetadata({});
    } finally {
      setIsDbLoading(false);
      setIsInitialized(true);
    }
  };

  const refreshDatabase = useCallback(async () => {
    await initializeDatabase();
  }, []);

  const addPlatform = useCallback((key: string, displayName?: string) => {
    const platformKey = key.toLowerCase().replace(/\s+/g, "_");

    setDatabase((db) => {
      if (db[platformKey]) return db;
      return { ...db, [platformKey]: [] };
    });

    setSchemas((s) => {
      if (s[platformKey]) return s;
      return { ...s, [platformKey]: ["name", "password"] };
    });

    setPlatformsMetadata((m) => {
      if (m[platformKey]) return m;

      const now = Date.now();
      const { findBestMatchingIcon } = require("../utils/iconLibrary");
      const iconMatch = findBestMatchingIcon(displayName || key);

      return {
        ...m,
        [platformKey]: {
          createdAt: now,
          updatedAt: now,
          icon: iconMatch?.platform || null,
          iconColor: iconMatch?.defaultColor || null,
        },
      };
    });
  }, []);

  const updatePlatformName = useCallback((oldKey: string, newName: string) => {
    const newKey = newName.toLowerCase().replace(/\s+/g, "_");

    setDatabase((db) => {
      if (db[newKey] || oldKey === newKey) return db;

      const { [oldKey]: accounts, ...rest } = db;
      const updatedAccounts = (accounts || []).map((acc: any) => ({
        ...acc,
        platform: newName,
      }));
      return { ...rest, [newKey]: updatedAccounts };
    });

    setSchemas((s) => {
      if (s[newKey] || oldKey === newKey) return s;

      const { [oldKey]: sch, ...rest } = s;
      return { ...rest, [newKey]: sch || ["name", "password"] };
    });

    setPlatformsMetadata((m) => {
      if (m[newKey] || oldKey === newKey) return m;

      const now = Date.now();
      const { [oldKey]: oldMeta, ...rest } = m;
      const { findBestMatchingIcon } = require("../utils/iconLibrary");
      const iconMatch = findBestMatchingIcon(newName);

      return {
        ...rest,
        [newKey]: {
          createdAt: oldMeta?.createdAt || now,
          updatedAt: now,
          icon: iconMatch?.platform || null,
          iconColor: iconMatch?.defaultColor || null,
        },
      };
    });
  }, []);

  const updatePlatformIcon = useCallback(
    (platformKey: string, icon: string | null, iconColor?: string | null) => {
      const now = Date.now();
      setPlatformsMetadata((m) => ({
        ...m,
        [platformKey]: {
          ...m[platformKey],
          icon,
          iconColor: iconColor !== undefined ? iconColor : m[platformKey]?.iconColor || null,
          updatedAt: now,
        },
      }));
    },
    []
  );

  const updatePlatformDisplayField = useCallback(
    (platformKey: string, displayField: string | null) => {
      const now = Date.now();
      setPlatformsMetadata((m) => ({
        ...m,
        [platformKey]: {
          ...m[platformKey],
          displayField,
          updatedAt: now,
        },
      }));
    },
    []
  );

  const deletePlatform = useCallback((key: string) => {
    setDatabase((db) => {
      const { [key]: _, ...rest } = db;
      return rest;
    });

    setSchemas((s) => {
      const { [key]: _, ...rest } = s;
      return rest;
    });

    setPlatformsMetadata((m) => {
      const { [key]: _, ...rest } = m;
      return rest;
    });
  }, []);

  const addAccount = useCallback(
    (platformKey: string, payload: Omit<Account, "id" | "createdAt" | "updatedAt">) => {
      const now = Date.now();
      const id = `acc_${now}_${Math.floor(Math.random() * 9999)}`;

      setDatabase((db) => ({
        ...db,
        [platformKey]: [
          ...(db[platformKey] || []),
          { id, ...payload, createdAt: now, updatedAt: now },
        ],
      }));

      setPlatformsMetadata((m) => ({
        ...m,
        [platformKey]: {
          ...m[platformKey],
          updatedAt: now,
        },
      }));
    },
    []
  );

  const updateAccount = useCallback((platformKey: string, id: string, updated: Account) => {
    const now = Date.now();

    setDatabase((db) => ({
      ...db,
      [platformKey]: (db[platformKey] || []).map((a) =>
        a.id === id ? { ...a, ...updated, id, updatedAt: now } : a
      ),
    }));

    setPlatformsMetadata((m) => ({
      ...m,
      [platformKey]: {
        ...m[platformKey],
        updatedAt: now,
      },
    }));
  }, []);

  const deleteAccount = useCallback((platformKey: string, id: string) => {
    const now = Date.now();

    setDatabase((db) => ({
      ...db,
      [platformKey]: (db[platformKey] || []).filter((a) => a.id !== id),
    }));

    setPlatformsMetadata((m) => ({
      ...m,
      [platformKey]: {
        ...m[platformKey],
        updatedAt: now,
      },
    }));
  }, []);

  const updatePlatformSchema = useCallback((platformKey: string, newSchema: string[]) => {
    const filtered = Array.from(new Set(newSchema.map((s) => s.trim()).filter(Boolean)));

    setSchemas((s) => ({
      ...s,
      [platformKey]: filtered.length ? filtered : ["name", "password"],
    }));

    setDatabase((db) => {
      const updated = (db[platformKey] || []).map((acc) => {
        const next = { ...acc };

        filtered.forEach((f) => {
          if (!(f in next)) (next as any)[f] = "";
        });

        Object.keys(next).forEach((k) => {
          if (k !== "id" && k !== "createdAt" && k !== "updatedAt" && !filtered.includes(k)) {
            delete (next as any)[k];
          }
        });

        return next;
      });

      return { ...db, [platformKey]: updated };
    });
  }, []);

  const value = useMemo<DbContextType>(
    () => ({
      database,
      schemas,
      platformsMetadata,
      isDbLoading,
      dbError,
      dbVersion,
      addPlatform,
      updatePlatformName,
      updatePlatformIcon,
      updatePlatformDisplayField,
      deletePlatform,
      addAccount,
      updateAccount,
      deleteAccount,
      updatePlatformSchema,
      refreshDatabase,
    }),
    [
      database,
      schemas,
      platformsMetadata,
      isDbLoading,
      dbError,
      dbVersion,
      addPlatform,
      updatePlatformName,
      updatePlatformIcon,
      updatePlatformDisplayField,
      deletePlatform,
      addAccount,
      updateAccount,
      deleteAccount,
      updatePlatformSchema,
      refreshDatabase,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDb(): DbContextType {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDb must be used within DbProvider");
  return ctx;
}
