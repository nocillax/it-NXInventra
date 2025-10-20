"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { Comment } from "@/types/shared";

async function commentsFetcher(path: string) {
  // The real API will be `/api/inventories/:id/comments`
  const inventoryId = path.split("/")[2];
  const allComments: Comment[] = await apiFetch("/comments");
  return allComments
    .filter((comment) => comment.inventoryId === inventoryId)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

export function useComments(inventoryId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<Comment[]>(
    inventoryId ? `/inventories/${inventoryId}/comments` : null,
    commentsFetcher
  );

  return { comments: data, error, isLoading, mutate };
}
