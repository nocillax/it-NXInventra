// Create a custom error class to preserve backend error details
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const stack = new Error().stack;
  const callerLine = stack?.split("\n")[2]?.trim();

  console.log(`🚀 API CALL: ${path}`, {
    method: opts.method || "GET",
    caller: callerLine,
  });

  const base = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${base}${path}`, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  console.log(`📊 RESPONSE STATUS: ${res.status}`);

  // Handle empty responses for DELETE and other methods
  const contentType = res.headers.get("content-type");
  if (res.status === 204 || !contentType?.includes("application/json")) {
    console.log(`📦 RESPONSE DATA: [Empty response]`);
    if (!res.ok) {
      throw new ApiError(`API error: ${res.status}`, res.status);
    }
    return null;
  }

  const data = await res.json();
  console.log(`📦 RESPONSE DATA:`, data);

  if (!res.ok) {
    // Preserve the backend error message AND status code
    throw new ApiError(
      data.message || `API error: ${res.status}`,
      res.status,
      data
    );
  }

  return data;
}
