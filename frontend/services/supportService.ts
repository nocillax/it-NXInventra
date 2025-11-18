import { apiFetch } from "@/lib/apiClient";

export const createSupportTicket = async (data: {
  summary: string;
  priority: "High" | "Average" | "Low";
  inventoryTitle?: string;
  pageLink: string;
}) => {
  return apiFetch("/support/ticket", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
