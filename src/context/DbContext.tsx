import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialData = require("../../assets/database.json");
const DB_KEY = "@PasswordManager:database";

type Account = { id: string; name: string; email?: string; username?: string; password: string };
type Database = Record<string, Account[]>;

interface DbContextType {
  database: Database;
  isDbLoading: boolean;
  addPlatform: (name: string) => void;
  updatePlatformName: (oldKey: string, newKey: string) => void;
  deletePlatform: (key: string) => void;
  addAccount: (platformKey: string, account: Omit<Account, "id">) => void;
  updateAccount: (platformKey: string, accountId: string, updatedAccount: Account) => void;
  deleteAccount: (platformKey: string, accountId: string) => void;
}

const DbContext = createContext<DbContextType | undefined>(undefined);

export const DbProvider = ({ children }: { children: ReactNode }) => {
  const [database, setDatabase] = useState<Database>({});
  const [isDbLoading, setIsDbLoading] = useState(true);

  useEffect(() => {
    const loadDb = async () => {
      try {
        const storedDb = await AsyncStorage.getItem(DB_KEY);
        if (storedDb) {
          setDatabase(JSON.parse(storedDb));
        } else {
          setDatabase(initialData);
          await AsyncStorage.setItem(DB_KEY, JSON.stringify(initialData));
        }
      } catch (e) {
        console.error("Failed to load database:", e);
        setDatabase(initialData); // Fallback
      } finally {
        setIsDbLoading(false);
      }
    };
    loadDb();
  }, []);

  useEffect(() => {
    if (!isDbLoading) {
      AsyncStorage.setItem(DB_KEY, JSON.stringify(database)).catch((e) =>
        console.error("Failed to save database:", e)
      );
    }
  }, [database, isDbLoading]);

  const addPlatform = (name: string) => {
    const key = name.toLowerCase().replace(/\s+/g, "_");
    if (database[key]) {
      alert("Platform already exists.");
      return;
    }
    setDatabase((db) => ({ ...db, [key]: [] }));
  };

  const updatePlatformName = (oldKey: string, newName: string) => {
    const newKey = newName.toLowerCase().replace(/\s+/g, "_");
    if (newKey === oldKey) return;
    if (database[newKey]) {
      alert("A platform with that name already exists.");
      return;
    }
    setDatabase((db) => {
      const { [oldKey]: value, ...rest } = db;
      return { ...rest, [newKey]: value };
    });
  };

  const deletePlatform = (key: string) => {
    setDatabase((db) => {
      const { [key]: _, ...rest } = db;
      return rest;
    });
  };

  const addAccount = (platformKey: string, account: Omit<Account, "id">) => {
    const newAccount = { ...account, id: `acc_${Date.now()}` };
    setDatabase((db) => ({
      ...db,
      [platformKey]: [...(db[platformKey] || []), newAccount],
    }));
  };

  const updateAccount = (platformKey: string, accountId: string, updatedAccount: Account) => {
    setDatabase((db) => ({
      ...db,
      [platformKey]: db[platformKey].map((acc) =>
        acc.id === accountId ? updatedAccount : acc
      ),
    }));
  };

  const deleteAccount = (platformKey: string, accountId: string) => {
    setDatabase((db) => ({
      ...db,
      [platformKey]: db[platformKey].filter((acc) => acc.id !== accountId),
    }));
  };

  return (
    <DbContext.Provider
      value={{
        database,
        isDbLoading,
        addPlatform,
        updatePlatformName,
        deletePlatform,
        addAccount,
        updateAccount,
        deleteAccount,
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error("useDb must be used within a DbProvider");
  }
  return context;
};
