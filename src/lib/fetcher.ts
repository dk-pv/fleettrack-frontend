export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem("token");

  // FormData uploads must NOT carry a JSON Content-Type — the browser sets the
  // multipart boundary itself. Everything else (JSON requests) is unchanged.
  const isFormData =
    typeof FormData !== "undefined" && options?.body instanceof FormData;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),

      Authorization: token ? `Bearer ${token}` : "",

      ...options?.headers,
    },
  });

  if (response.status === 401) {
    localStorage.clear();

    window.location.href = "/login";
  }

  return response;
}
