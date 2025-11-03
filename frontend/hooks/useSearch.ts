// useSearch.ts
import { useEffect, useState } from "react";
import { Inventory, Item } from "@/types/shared";

interface SearchResult {
  inventories: Inventory[];
  items: Item[];
}

export function useSearch(query: string) {
  const [data, setData] = useState<SearchResult>({
    inventories: [],
    items: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setData({ inventories: [], items: [] });
      setError(null);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(
            query
          )}&limit=10`,
          {
            credentials: "include", // This sends cookies to cross-origin requests
          }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const results = await response.json();
        setData(results);
      } catch (error) {
        console.error("Search failed:", error);
        setError(error instanceof Error ? error.message : "Search failed");
        setData({ inventories: [], items: [] });
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { data, isLoading, error };
}
