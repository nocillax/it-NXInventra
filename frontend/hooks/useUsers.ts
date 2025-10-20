"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/apiClient";
import { User } from "@/types/shared";

export function useUsers() {
  const { data, error, isLoading } = useSWR<User[]>("/users", apiFetch);

  return {
    users: data,
    isLoading,
    error,
  };
}
