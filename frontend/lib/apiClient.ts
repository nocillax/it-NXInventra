import { v4 as uuidv4 } from "uuid";
import { Item, NewItem } from "@/types/shared";
import { fetchMock } from "./mockApi";

export async function apiFetch(path: string, opts: RequestInit = {}) {
  // As per ICD, use mock data if the environment variable is set
  if (process.env.NEXT_PUBLIC_USE_MOCK === "1") {
    // The mock API returns the data directly, not nested in a `data` property.
    const mockData = await fetchMock(path, opts);
    return mockData;
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const res = await fetch(`${base}${path}`, {
    ...opts,
    credentials: "include", // Required for sending cookies (JWT)
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "An API error occurred");
  }
  return data.data; // As per PRD#3, our data is nested in the 'data' property
}
