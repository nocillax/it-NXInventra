import { ReactNode } from "react";

export type UUID = string;

export interface User {
  id: UUID;
  name: string;
  email: string;
  avatar?: string;
  provider?: "google" | "github";
}

export type CustomFieldType =
  | "text"
  | "number"
  | "boolean"
  | "url"
  | "longtext";

export interface CustomField {
  id: UUID; // Unique ID for the field definition itself
  name: string;
  type: CustomFieldType;
  showInTable?: boolean;
  validation?: string | null;
}

export type IdSegmentType = "fixed" | "date" | "sequence" | "random" | "guid";

export interface IdSegment {
  id: UUID;
  type: IdSegmentType;
  value?: string; // For 'fixed' type
  format?: string; // For 'date', 'sequence', etc.
}

export interface Inventory {
  id: string; // e.g., "inv_computers"
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  public: boolean;
  ownerId: UUID;
  idFormat: IdSegment[];
  customFields: CustomField[];
}

export interface Item {
  id: UUID; // Internal, unique identifier for the item (e.g., a UUID)
  customId: string; // The user-facing, formatted ID (e.g., "LAP-2024-001")
  inventoryId: string;
  fields: Record<string, any>;
  likes?: number;
  createdBy?: UUID;
  createdAt?: string;
}

export interface NewItem {
  inventoryId: string;
  fields: { [key: string]: any };
}

export type Role = "Owner" | "Writer" | "Viewer";

export interface Access {
  id: UUID;
  inventoryId: string;
  userId: UUID;
  role: Role;
}

export interface Comment {
  id: UUID;
  inventoryId: string;
  userId: UUID;
  message: string;
  timestamp: string;
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

export interface InventoryStats {
  inventoryId: string;
  visibility: "public" | "private";
  totalItems: number;
  avgPrice: number | null;
  avgQuantity: number | null;
  totalQuantity: number | null;
  quantityDistribution: { label: string; quantity: number }[] | null;
  topContributors: Contributor[];
  monthlyAdditions: MonthlyAddition[];
}

export type LocaleLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};
