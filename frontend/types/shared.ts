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
  id: UUID;
  name: string;
  type: CustomFieldType;
  showInTable?: boolean;
  validation?: string | null;
}

export interface Inventory {
  id: string; // e.g., "inv_computers"
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  public: boolean;
  ownerId: UUID;
  idFormat?: string;
  customFields: CustomField[];
}

export interface Item {
  id: string; // This is the custom, user-facing ID like "LAP-2025-001"
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
