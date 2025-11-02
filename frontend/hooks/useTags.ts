// hooks/useTags.ts - FIXED VERSION
"use client";

import useSWR from "swr";
import { tagService } from "@/services/tagService";
import { useMemo } from "react";

// hooks/useTags.ts - Improved for better matching
export function useTags(query?: string) {
  const { data, error, isLoading } = useSWR<string[]>(
    query ? `tags-${query}` : "tags",
    () => (query ? tagService.searchTags(query) : tagService.getTags()),
    {
      fallbackData: [],
      dedupingInterval: 2000, // Reduce API calls
    }
  );

  // Filter suggestions to only those that start with the query
  const filteredSuggestions = useMemo(() => {
    if (!query || !data) return [];
    return data.filter((tag) =>
      tag.toLowerCase().startsWith(query.toLowerCase())
    );
  }, [data, query]);

  return {
    tags: query ? filteredSuggestions : data || [],
    error,
    isLoading,
  };
}
