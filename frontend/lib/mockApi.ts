import { v4 as uuidv4 } from "uuid";
import inventories from "@/mock/inventories.json";
import items from "@/mock/items.json";
import comments from "@/mock/comments.json";
import users from "@/mock/users.json";
import access from "@/mock/access.json";
import { Inventory, Item, NewItem } from "@/types/shared";

// Make items mutable for the mock API
let mockInventories: Inventory[] = JSON.parse(JSON.stringify(inventories));
let mockItems: Item[] = [...items];

const mockData: Record<string, any[]> = {
  "/inventories": mockInventories,
  "/items": mockItems,
  "/comments": comments,
  "/users": users,
};

/**
 * Simulates a network request by fetching from our local mock JSON files.
 * The path should correspond to a key in the mockData object.
 */
export async function fetchMock(path: string, opts: RequestInit = {}) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const pathName = path.split("?")[0];

  if (opts.method === "PUT") {
    if (pathName.startsWith("/inventories/")) {
      const inventoryId = pathName.split("/").pop();
      const updatedData = JSON.parse(opts.body as string);
      const inventoryIndex = mockInventories.findIndex(
        (inv) => inv.id === inventoryId
      );
      if (inventoryIndex !== -1) {
        mockInventories[inventoryIndex] = {
          ...mockInventories[inventoryIndex],
          ...updatedData,
        };
        return mockInventories[inventoryIndex];
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
      mockData["/items"] = mockItems; // This is the critical fix
      return { success: true };
    }
  }

  if (opts.method === "POST") {
    if (pathName === "/items") {
      const newItemData: NewItem = JSON.parse(opts.body as string);

      // Simulate ID generation based on PRD
      const inventory = inventories.find(
        (inv) => inv.id === newItemData.inventoryId
      );
      if (!inventory) {
        throw new Error("Inventory not found for new item");
      }
      const counter =
        mockItems.filter((i) => i.inventoryId === newItemData.inventoryId)
          .length + 1;
      const customId = inventory.idFormat
        .replace("{YEAR}", new Date().getFullYear().toString())
        .replace("{COUNTER(3)}", counter.toString().padStart(3, "0"));

      const newItem: Item = {
        id: customId,
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

  const data = mockData[pathName]; // Ignore query params for mock
  if (!data) {
    throw new Error(`Mock data not found for path: ${path}`);
  }
  return data;
}
