import { ReactNode } from "react";

export type UUID = string;

// types/shared.ts
export interface User {
  id: string;
  name: string;
  email: string;
  provider?: string;
  isAdmin?: boolean;
  theme?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CustomFieldType =
  | "text"
  | "number"
  | "boolean"
  | "link"
  | "textarea";

export interface CustomField {
  id: number;
  inventoryId: string;
  title: string;
  description: string | null;
  type: "text" | "number" | "boolean" | "link" | "textarea";
  showInTable: boolean;
  orderIndex: number;
  createdAt: string;
}

export type IdSegmentType =
  | "fixed"
  | "date"
  | "sequence"
  | "random_6digit"
  | "random_9digit"
  | "random_20bit"
  | "random_32bit"
  | "guid";

export interface IdSegment {
  id: UUID;
  type: IdSegmentType;
  value?: string; // For 'fixed' type
  format?: string; // For 'date', 'sequence', etc.
}

export interface Inventory {
  id: string;
  title: string;
  description?: string;
  category?: string;
  public: boolean;
  createdBy: string;
  idFormat: IdSegment[];
  customFields: CustomField[];
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  tags:
    | Array<{
        id: number;
        name: string;
        createdAt: string;
      }>
    | string[]; // Handle both object and string formats
}

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
  inventoryCount?: number;
}

export interface Item {
  id: UUID; // Internal, unique identifier for the item (e.g., a UUID)
  customId: string; // The user-facing, formatted ID (e.g., "LAP-2024-001")
  inventoryId: string;
  fields: Record<string, any>;
  likes?: number;
  version: number;
  createdBy?: UUID;
  createdAt?: string;
}

export interface NewItem {
  fields: { [key: string]: any };
}

export interface CreateItemData {
  fields: Record<string, any>; // string keys like "32", "33" etc.
}

export interface UpdateItemData {
  version: number;
  fields?: Record<string, any>; // string keys like "32", "33" etc.
  customId?: string;
}

export type Role = "Owner" | "Editor" | "Viewer";

export interface Access {
  userId: UUID;
  userName: string;
  userEmail: string;
  role: Role;
  createdAt: string;
}

export interface Discussion {
  id: string;
  message: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StatSummary {
  [key: string]: number;
}

export interface FieldSummary {
  fieldName: string;
  type: "text" | "number";
  summary: StatSummary;
}

export interface Contributor {
  userId: UUID;
  count: number;
}

export interface MonthlyAddition {
  month: string;
  count: number;
}

// types/shared.ts or wherever you keep your types

export interface InventoryStats {
  totalItems: number;
  topContributors: Contributor[];
  monthlyGrowth: MonthlyGrowth[];
  priceStats?: PriceStats; // Optional since it might not exist
  quantityStats?: QuantityStats; // Optional since it might not exist
}

export interface Contributor {
  userId: string;
  name: string;
  itemCount: number;
}

export interface MonthlyGrowth {
  month: string; // Format: "2025-11"
  year: number;
  count: number;
}

export interface PriceStats {
  avg: number;
  min: number;
  max: number;
  total: number;
}

export interface QuantityStats {
  avg: number;
  min: number;
  max: number;
  total: number;
}

export interface MonthlyAddition {
  month: string;
  count: number;
}

export type LocaleLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export interface SearchResult {
  inventories: Inventory[];
  items: Item[];
}

export interface InventorySearchResult extends Inventory {
  // Inherits from your existing Inventory entity
}

export interface ItemSearchResult extends Item {
  inventoryTitle?: string; // You might want to join this
}
