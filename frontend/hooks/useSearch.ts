import useSWR from "swr";
import { Inventory, Item } from "@/types/shared";
import { useDebounce } from "use-debounce";
import { apiFetch } from "@/lib/apiClient";

interface SearchResults {
  inventories: Inventory[];
  items: Item[];
}

const searchFetcher = async (query: string): Promise<SearchResults> => {
  if (!query) {
    return { inventories: [], items: [] };
  }
  // Fetch in parallel
  const [inventories, items] = await Promise.all([
    apiFetch(`/search/inventories?q=${encodeURIComponent(query)}`) as Promise<
      Inventory[]
    >,
    apiFetch(`/search/items?q=${encodeURIComponent(query)}`) as Promise<Item[]>,
  ]);
  return { inventories, items };
};

export function useSearch(query: string) {
  const [debouncedQuery] = useDebounce(query, 300);

  const { data, error, isLoading } = useSWR<SearchResults>(
    debouncedQuery ? `search-${debouncedQuery}` : null,
    () => searchFetcher(debouncedQuery) // Direct call
  );

  return { data, error, isLoading: (query && !data && !error) || isLoading };
}
