import { v4 as uuidv4 } from "uuid";
import inventories from "@/mock/inventories.json";
import items from "@/mock/items.json";
import comments from "@/mock/comments.json";
import users from "@/mock/users.json";
import access from "@/mock/access.json";
import { Inventory, Item, NewItem } from "@/types/shared";
import { generateItemId } from "./formatters";

// Make items mutable for the mock API
let mockInventories: Inventory[] = JSON.parse(JSON.stringify(inventories));
let mockItems: Item[] = [...items];

/**
 * Simulates a network request by fetching from our local mock JSON files.
 * The path should correspond to a key in the mockData object.
 */
export async function fetchMock(path: string, opts: RequestInit = {}) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Handle single inventory fetch
  if (path.startsWith("/inventories/")) {
    const inventoryId = path.split("/").pop();
    const inventory = mockInventories.find((inv) => inv.id === inventoryId);
    if (inventory) return inventory;
    // Fall through to other methods or throw error at the end
  }

  const pathName = path.split("?")[0];

  // Handle list fetches
  if (opts.method === "GET" || !opts.method) {
    if (pathName === "/inventories") {
      return JSON.parse(JSON.stringify(mockInventories));
    }
    if (pathName === "/items") {
      return JSON.parse(JSON.stringify(mockItems));
    }
  }

  if (opts.method === "PUT") {
    if (pathName.startsWith("/inventories/")) {
      const inventoryId = pathName.split("/").pop();
      const updatedData = JSON.parse(opts.body as string);
      const inventoryIndex = mockInventories.findIndex(
        (inv) => inv.id === inventoryId
      );
      if (inventoryIndex !== -1) {
        const updatedInventory = {
          ...mockInventories[inventoryIndex],
          ...updatedData,
        };
        mockInventories[inventoryIndex] = updatedInventory;
        return updatedInventory;
      }
      throw new Error("Inventory not found for update");
    }
    if (pathName.startsWith("/items/")) {
      const itemId = pathName.split("/").pop();
      const updatedData = JSON.parse(opts.body as string);
      const itemIndex = mockItems.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        mockItems[itemIndex] = { ...mockItems[itemIndex], ...updatedData };
        return mockItems[itemIndex];
      }
      throw new Error("Item not found for update");
    }
  }

  if (opts.method === "DELETE") {
    if (pathName.startsWith("/items/")) {
      const itemId = pathName.split("/").pop();
      mockItems = mockItems.filter((item) => item.id !== itemId);
      return { success: true };
    }
  }

  if (opts.method === "POST") {
    if (pathName === "/items") {
      const newItemData: NewItem = JSON.parse(opts.body as string);

      // Simulate ID generation based on PRD
      const inventory = mockInventories.find(
        (inv) => inv.id === newItemData.inventoryId
      );
      if (!inventory) {
        throw new Error("Inventory not found for new item");
      }
      const counter =
        mockItems.filter((i) => i.inventoryId === newItemData.inventoryId)
          .length + 1;

      // Generate ID from segments
      const customId = generateItemId(inventory.idFormat, counter);

      const newItem: Item = {
        id: uuidv4(), // Internal UUID
        customId: customId, // Generated user-facing ID
        inventoryId: newItemData.inventoryId,
        fields: newItemData.fields,
        likes: 0,
        createdBy: "u_01", // Mocked current user
        createdAt: new Date().toISOString(),
      };

      mockItems.unshift(newItem); // Add to the start of the array
      return newItem;
    }
  }

  throw new Error(`Mock API handler not found for path: ${path}`);
}
