// src/constants/icons/types.ts

export type IconLibrary =
  | "MaterialIcons"
  | "MaterialCommunityIcons"
  | "FontAwesome"
  | "FontAwesome5"
  | "Ionicons"
  | "AntDesign"
  | "Entypo"
  | "Feather";

export type IconCategory =
  | "social"
  | "productivity"
  | "finance"
  | "storage"
  | "communication"
  | "media"
  | "developer"
  | "shopping"
  | "travel"
  | "gaming"
  | "education"
  | "identity"
  | "crypto"
  | "banking"
  | "ai"
  | "other";

export interface IconDefinition {
  library: IconLibrary;
  iconName: string;
  defaultColor: string;
  category: IconCategory;
  keywords: string[];
  displayName?: string;
}

export type CompactIconDef = [string, string, string, IconCategory, string[]];

export const LIBRARY_MAP: Record<string, IconLibrary> = {
  MI: "MaterialIcons",
  MCI: "MaterialCommunityIcons",
  FA: "FontAwesome",
  FA5: "FontAwesome5",
  Ion: "Ionicons",
  AD: "AntDesign",
  Ent: "Entypo",
  Fea: "Feather",
};

export interface IconMapping {
  platform: string;
  displayName: string;
  library: IconLibrary;
  iconName: string;
  defaultColor: string;
  category: IconCategory;
  keywords: string[];
}
