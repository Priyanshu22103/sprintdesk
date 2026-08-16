import { useAuthStore } from "../stores/authStore";
import { refreshAccessToken } from "./authApi";

const API_BASE_URL = "https://jsonplaceholder.typicode.com";

export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  let accessToken =
    useAuthStore.getState().accessToken;

  let headers = new Headers(options.headers);

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  let response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    },
  );

  // Simulate an expired access token.
  // This lets us test the refresh flow during development.
  if (response.status === 401) {
    const currentRefreshToken =
      useAuthStore.getState().refreshToken;

    if (!currentRefreshToken) {
      useAuthStore.getState().logout();

      return response;
    }

    try {
      const refreshed =
        await refreshAccessToken(
          currentRefreshToken,
        );

      const currentUser =
        useAuthStore.getState().user;

      if (!currentUser) {
        useAuthStore.getState().logout();

        return response;
      }

      useAuthStore.getState().login(
        currentUser,
        refreshed.accessToken,
        refreshed.refreshToken ??
          currentRefreshToken,
      );

      accessToken = refreshed.accessToken;

      headers = new Headers(options.headers);

      headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );

      // Retry the original request.
      response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          ...options,
          headers,
        },
      );
    } catch {
      useAuthStore.getState().logout();
    }
  }

  return response;
}