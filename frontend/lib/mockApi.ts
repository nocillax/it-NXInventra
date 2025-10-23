import { v4 as uuidv4 } from "uuid";
import inventories from "@/mock/inventories.json";
import items from "@/mock/items.json";
import initialComments from "@/mock/comments.json";
import initialUsers from "@/mock/users.json";
import initialAccess from "@/mock/access.json";
import initialStats from "@/mock/stats.json";
import { Inventory, Item, NewItem } from "@/types/shared";
import { generateItemId } from "./formatters";

// Make items mutable for the mock API
let mockInventories: Inventory[] = JSON.parse(JSON.stringify(inventories));
let mockItems: Item[] = [...items];
let mockComments = [...initialComments];
let mockUsers = [...initialUsers];
let mockAccess = [...initialAccess];
let mockStats = [...initialStats];

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

  const url = new URL(path, "http://localhost"); // Dummy base to parse URL
  const pathName = url.pathname;

  // Handle list fetches
  if (opts.method === "GET" || !opts.method) {
    const inventoryId = url.searchParams.get("inventoryId");

    if (pathName === "/inventories") {
      return JSON.parse(JSON.stringify(mockInventories));
    }
    if (pathName === "/items") {
      if (inventoryId) {
        return mockItems.filter((item) => item.inventoryId === inventoryId);
      }
      return JSON.parse(JSON.stringify(mockItems));
    }
    if (pathName === "/users") {
      return JSON.parse(JSON.stringify(mockUsers));
    }
    if (pathName === "/comments") {
      let results = mockComments;
      if (inventoryId) {
        results = mockComments.filter((c) => c.inventoryId === inventoryId);
      }
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);
      const startIndex = (page - 1) * limit;
      return results.slice(startIndex, startIndex + limit);
    }
    if (pathName === "/access") {
      return JSON.parse(JSON.stringify(mockAccess));
    }
    if (pathName === "/stats") {
      return JSON.parse(JSON.stringify(mockStats));
    }

    // Handle search requests
    if (path.startsWith("/search/")) {
      const query = url.searchParams.get("q")?.toLowerCase();

      if (!query) {
        return [];
      }

      if (path.startsWith("/search/inventories")) {
        return mockInventories.filter(
          (inv) =>
            inv.title.toLowerCase().includes(query) ||
            (inv.description &&
              inv.description.toLowerCase().includes(query)) ||
            inv.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      if (path.startsWith("/search/items")) {
        return mockItems.filter((item) => {
          if (item.customId.toLowerCase().includes(query)) {
            return true;
          }
          return Object.values(item.fields).some((value) =>
            String(value).toLowerCase().includes(query)
          );
        });
      }
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
    if (pathName.startsWith("/access/")) {
      const accessId = pathName.split("/").pop();
      const updatedData = JSON.parse(opts.body as string);
      const accessIndex = mockAccess.findIndex((a) => a.id === accessId);
      if (accessIndex !== -1) {
        mockAccess[accessIndex] = {
          ...mockAccess[accessIndex],
          ...updatedData,
        };
        return mockAccess[accessIndex];
      }
      throw new Error("Access entry not found for update");
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
    if (pathName.startsWith("/access/")) {
      const accessId = pathName.split("/").pop();
      mockAccess = mockAccess.filter((a) => a.id !== accessId);
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
    if (pathName === "/comments") {
      const newCommentData = JSON.parse(opts.body as string);
      const newComment = {
        id: uuidv4(),
        inventoryId: newCommentData.inventoryId,
        userId: "u_rahim", // Mocked current user
        message: newCommentData.message,
        timestamp: new Date().toISOString(),
      };

      mockComments.push(newComment);
      return newComment;
    }
    if (pathName === "/access") {
      const newAccessData = JSON.parse(opts.body as string);
      // In a real app, you'd validate this data
      mockAccess.push(newAccessData);
      return newAccessData;
    }
  }

  throw new Error(`Mock API handler not found for path: ${path}`);
}
