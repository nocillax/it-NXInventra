// hooks/useUsers.ts
import useSWR from "swr";
import { userService } from "@/services/userService";
import { User } from "@/types/shared";

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useUsers = (page: number = 1, limit: number = 50) => {
  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `/users?page=${page}&limit=${limit}`,
    () => userService.getAllUsers(page, limit),
    {
      refreshInterval: 5000, // 5 second polling
      revalidateOnFocus: true,
    }
  );

  return {
    users: data?.users || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    mutate,
  };
};
