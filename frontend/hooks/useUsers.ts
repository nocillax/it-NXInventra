// // hooks/useUsers.ts - TEMPORARY FIX
// import useSWR from "swr";
// import { User } from "@/types/shared";

// export function useUsers() {
//   // For explore page, we don't need all users - return empty array
//   const { data, error, isLoading } = useSWR<User[] | null>(
//     null, // Don't call any endpoint for now
//     () => [] // Return empty array
//   );

//   return {
//     users: data,
//     isLoading,
//     error,
//   };
// }
