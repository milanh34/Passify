import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialData = require("../../assets/database.json");
const DB_KEY = "@PM:database";
const SCHEMA_KEY = "@PM:schemas";

type Account = { id: string; name: string; [k: string]: any };
type Database = Record<string, Account[]>;
type Schemas = Record<string, string[]>;

const defaultSchemas: Schemas = {
  google: ["name", "email", "password"],
  instagram: ["name", "username", "password"],
  github: ["name", "username", "email", "password"],
};

const Ctx = createContext<any>(null);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [database, setDatabase] = useState<Database>({});
  const [schemas, setSchemas] = useState<Schemas>({});
  const [isDbLoading, setIsDbLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [db, sc] = await AsyncStorage.multiGet([DB_KEY, SCHEMA_KEY]);
        const dbVal = db[1] ? JSON.parse(db[1]) : initialData;
        const scVal = sc[1] ? JSON.parse(sc[1]) : defaultSchemas;
        setDatabase(dbVal);
        setSchemas(scVal);
        if (!db[1]) await AsyncStorage.setItem(DB_KEY, JSON.stringify(dbVal));
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
      ]);
    }
  }, [database, schemas, isDbLoading]);

  const addPlatform = (name: string) => {
    const key = name.toLowerCase().replace(/\s+/g, "_");
    if (database[key]) return;
    setDatabase((db) => ({ ...db, [key]: [] }));
    setSchemas((s) => ({ ...s, [key]: ["name", "password"] }));
  };

  const updatePlatformName = (oldKey: string, newName: string) => {
    const newKey = newName.toLowerCase().replace(/\s+/g, "_");
    if (database[newKey] || oldKey === newKey) return;
    setDatabase((db) => {
      const { [oldKey]: arr, ...rest } = db;
      return { ...rest, [newKey]: arr || [] };
    });
    setSchemas((s) => {
      const { [oldKey]: sch, ...rest } = s;
      return { ...rest, [newKey]: sch || ["name", "password"] };
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
  };

  const addAccount = (platformKey: string, payload: Omit<Account, "id">) => {
    const id = `acc_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    setDatabase((db) => ({ ...db, [platformKey]: [...(db[platformKey] || []), { id, ...payload }] }));
  };

  const updateAccount = (platformKey: string, id: string, updated: Account) => {
    setDatabase((db) => ({
      ...db,
      [platformKey]: (db[platformKey] || []).map((a) => (a.id === id ? { ...a, ...updated, id } : a)),
    }));
  };

  const deleteAccount = (platformKey: string, id: string) => {
    setDatabase((db) => ({
      ...db,
      [platformKey]: (db[platformKey] || []).filter((a) => a.id !== id),
    }));
  };

  const updatePlatformSchema = (platformKey: string, newSchema: string[]) => {
    const filtered = Array.from(new Set(newSchema.map((s) => s.trim()).filter(Boolean)));
    setSchemas((s) => ({ ...s, [platformKey]: filtered.length ? filtered : ["name", "password"] }));
    setDatabase((db) => {
      const updated = (db[platformKey] || []).map((acc) => {
        const next = { ...acc };
        filtered.forEach((f) => {
          if (!(f in next)) next[f] = "";
        });
        Object.keys(next).forEach((k) => {
          if (k !== "id" && !filtered.includes(k)) delete (next as any)[k];
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
      isDbLoading,
      addPlatform,
      updatePlatformName,
      deletePlatform,
      addAccount,
      updateAccount,
      deleteAccount,
      updatePlatformSchema,
    }),
    [database, schemas, isDbLoading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDb() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDb must be used within DbProvider");
  return ctx;
}
