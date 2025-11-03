import useSWR from "swr";
import { Discussion } from "@/types/shared";
import { discussionService } from "@/services/discussionService";
import { useState } from "react";

interface DiscussionResponse {
  comments: Discussion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function useDiscussion(inventoryId: string) {
  const [currentPage, setCurrentPage] = useState(1);
  const [allDiscussions, setAllDiscussions] = useState<Discussion[]>([]);
  const limit = 10;

  const { data, error, isLoading, mutate } = useSWR<DiscussionResponse>(
    inventoryId
      ? `/inventories/${inventoryId}/comments?page=${currentPage}&limit=${limit}`
      : null,
    () => discussionService.getComments(inventoryId, currentPage, limit),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      onSuccess: (data) => {
        // Accumulate comments instead of replacing
        if (data && data.comments) {
          setAllDiscussions((prev) => {
            // Merge and remove duplicates
            const merged = [...prev, ...data.comments];
            const unique = merged.filter(
              (discussion, index, self) =>
                index === self.findIndex((d) => d.id === discussion.id)
            );
            return unique;
          });
        }
      },
    }
  );

  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setAllDiscussions([]);
  };

  // Sort all accumulated discussions by timestamp (newest first)
  const sortedDiscussions = [...allDiscussions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    discussions: sortedDiscussions,
    pagination: data?.pagination,
    isLoading,
    error,
    mutate: () => {
      resetPagination();
      mutate();
    },
    loadMore,
    resetPagination,
    hasMore: data?.pagination?.hasNext || false,
  };
}
