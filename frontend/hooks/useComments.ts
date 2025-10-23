"use client";

import useSWRInfinite from "swr/infinite";
import { apiFetch } from "@/lib/apiClient";
import { Comment } from "@/types/shared";

const PAGE_SIZE = 10;

const getKey = (
  pageIndex: number,
  previousPageData: Comment[] | null,
  inventoryId: string
) => {
  if (previousPageData && !previousPageData.length) return null; // Reached the end
  return `/comments?inventoryId=${inventoryId}&page=${
    pageIndex + 1
  }&limit=${PAGE_SIZE}`;
};

export function useComments(inventoryId: string) {
  const { data, error, isLoading, mutate, size, setSize, isValidating } =
    useSWRInfinite<Comment[]>(
      (pageIndex, previousPageData) =>
        getKey(pageIndex, previousPageData, inventoryId),
      apiFetch
    );

  return {
    comments: data,
    error,
    isLoading,
    mutate,
    size,
    setSize,
    isLoadingMore:
      isLoading || (size > 0 && data && typeof data[size - 1] === "undefined"),
    isReachingEnd: data && data[data.length - 1]?.length < PAGE_SIZE,
  };
}
