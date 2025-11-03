// hooks/useCategories.ts
"use client";

import useSWR from "swr";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/shared";

export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>(
    "/categories",
    categoryService.getCategories
  );

  return {
    categories: data || [],
    error,
    isLoading,
  };
}
