"use client";

import useSWR from "swr";
import { getUsers } from "@/lib/api/users";
import { User } from "@/types/shared";

export function useUsers() {
  const { data, error, isLoading } = useSWR<User[] | null>("/users", getUsers);

  return {
    users: data,
    isLoading,
    error,
  };
}
