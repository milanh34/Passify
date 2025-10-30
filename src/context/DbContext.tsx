import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialData = require("../../assets/database.json");

const DB_KEY = "@PM:database";
const SCHEMA_KEY = "@PM:schemas";
const METADATA_KEY = "@PM:platform_metadata";

type Account = { id: string; name: string; createdAt?: number; updatedAt?: number; [k: string]: any };
type Database = Record<string, Account[]>;
type Schemas = Record<string, string[]>;

// Platform metadata type
type PlatformMetadata = {
  createdAt: number;
  updatedAt: number;
};
type PlatformsMetadata = Record<string, PlatformMetadata>;

const defaultSchemas: Schemas = {
  google: ["name", "email", "password"],
  instagram: ["name", "username", "password"],
  github: ["name", "username", "email", "password"],
};

const Ctx = createContext<any>(null);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [database, setDatabase] = useState<Database>({});
  const [schemas, setSchemas] = useState<Schemas>({});
  const [platformsMetadata, setPlatformsMetadata] = useState<PlatformsMetadata>({});
  const [isDbLoading, setIsDbLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [db, sc, meta] = await AsyncStorage.multiGet([DB_KEY, SCHEMA_KEY, METADATA_KEY]);
        const dbVal = db[1] ? JSON.parse(db[1]) : initialData;
        const scVal = sc[1] ? JSON.parse(sc[1]) : defaultSchemas;
        const metaVal = meta[1] ? JSON.parse(meta[1]) : {};

        const now = Date.now();
        
        // Migrate platforms to have metadata
        const updatedMeta = { ...metaVal };
        let needsMetaUpdate = false;

        Object.keys(dbVal).forEach((key) => {
          if (!updatedMeta[key]) {
            updatedMeta[key] = {
              createdAt: now - Math.floor(Math.random() * 86400000 * 30), // Random time in last 30 days
              updatedAt: now,
            };
            needsMetaUpdate = true;
          }
        });

        // Migrate accounts to have timestamps
        let needsDbUpdate = false;
        Object.keys(dbVal).forEach((platformKey) => {
          const accounts = dbVal[platformKey] || [];
          dbVal[platformKey] = accounts.map((acc: any) => {
            if (!acc.createdAt || !acc.updatedAt) {
              needsDbUpdate = true;
              return {
                ...acc,
                createdAt: acc.createdAt || now - Math.floor(Math.random() * 86400000 * 60), // Random within last 60 days
                updatedAt: acc.updatedAt || now - Math.floor(Math.random() * 86400000 * 30), // Random within last 30 days
              };
            }
            return acc;
          });
        });

        setDatabase(dbVal);
        setSchemas(scVal);

        if (needsMetaUpdate) {
          setPlatformsMetadata(updatedMeta);
          await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(updatedMeta));
        } else {
          setPlatformsMetadata(metaVal);
        }

        if (!db[1] || needsDbUpdate) await AsyncStorage.setItem(DB_KEY, JSON.stringify(dbVal));
        if (!sc[1]) await AsyncStorage.setItem(SCHEMA_KEY, JSON.stringify(scVal));
      } finally {
        setIsDbLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isDbLoading) {
      AsyncStorage.multiSet([
        [DB_KEY, JSON.stringify(database)],
        [SCHEMA_KEY, JSON.stringify(schemas)],
        [METADATA_KEY, JSON.stringify(platformsMetadata)],
      ]);
    }
  }, [database, schemas, platformsMetadata, isDbLoading]);

  const addPlatform = (key: string, displayName?: string) => {
    const platformKey = key.toLowerCase().replace(/\s+/g, "_");
    if (database[platformKey]) return;

    const now = Date.now();
    setDatabase((db) => ({ ...db, [platformKey]: [] }));
    setSchemas((s) => ({ ...s, [platformKey]: ["name", "password"] }));
    setPlatformsMetadata((m) => ({
      ...m,
      [platformKey]: { createdAt: now, updatedAt: now },
    }));
  };

  const updatePlatformName = (oldKey: string, newName: string) => {
    const newKey = newName.toLowerCase().replace(/\s+/g, "_");
    if (database[newKey] || oldKey === newKey) return;

    const now = Date.now();
    setDatabase((db) => {
      const { [oldKey]: accounts, ...rest } = db;
      const updatedAccounts = (accounts || []).map((acc: any) => ({
        ...acc,
        platform: newName,
      }));
      return { ...rest, [newKey]: updatedAccounts };
    });

    setSchemas((s) => {
      const { [oldKey]: sch, ...rest } = s;
      return { ...rest, [newKey]: sch || ["name", "password"] };
    });

    setPlatformsMetadata((m) => {
      const { [oldKey]: oldMeta, ...rest } = m;
      return {
        ...rest,
        [newKey]: {
          createdAt: oldMeta?.createdAt || now,
          updatedAt: now,
        },
      };
    });
  };

  const deletePlatform = (key: string) => {
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
  };

  const addAccount = (platformKey: string, payload: Omit<Account, "id" | "createdAt" | "updatedAt">) => {
    const now = Date.now();
    const id = `acc_${now}_${Math.floor(Math.random() * 9999)}`;

    setDatabase((db) => ({
      ...db,
      [platformKey]: [
        ...(db[platformKey] || []), 
        { id, ...payload, createdAt: now, updatedAt: now }
      ],
    }));

    // Update platform's updatedAt timestamp
    setPlatformsMetadata((m) => ({
      ...m,
      [platformKey]: {
        ...m[platformKey],
        updatedAt: now,
      },
    }));
  };

  const updateAccount = (platformKey: string, id: string, updated: Account) => {
    const now = Date.now();
    setDatabase((db) => ({
      ...db,
      [platformKey]: (db[platformKey] || []).map((a) =>
        a.id === id ? { ...a, ...updated, id, updatedAt: now } : a
      ),
    }));

    // Update platform's updatedAt timestamp
    setPlatformsMetadata((m) => ({
      ...m,
      [platformKey]: {
        ...m[platformKey],
        updatedAt: now,
      },
    }));
  };

  const deleteAccount = (platformKey: string, id: string) => {
    const now = Date.now();
    setDatabase((db) => ({
      ...db,
      [platformKey]: (db[platformKey] || []).filter((a) => a.id !== id),
    }));

    // Update platform's updatedAt timestamp
    setPlatformsMetadata((m) => ({
      ...m,
      [platformKey]: {
        ...m[platformKey],
        updatedAt: now,
      },
    }));
  };

  const updatePlatformSchema = (platformKey: string, newSchema: string[]) => {
    const filtered = Array.from(
      new Set(newSchema.map((s) => s.trim()).filter(Boolean))
    );

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
  };

  const value = useMemo(
    () => ({
      database,
      schemas,
      platformsMetadata,
      isDbLoading,
      addPlatform,
      updatePlatformName,
      deletePlatform,
      addAccount,
      updateAccount,
      deleteAccount,
      updatePlatformSchema,
    }),
    [database, schemas, platformsMetadata, isDbLoading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDb() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDb must be used within DbProvider");
  return ctx;
}
