import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";


import { apiClient } from "../apiClient";
import { useAuthStore } from "../../stores/authStore";

describe("apiClient authentication interceptor", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.setItem(
      "sprintdesk_refresh_token",
      "test-refresh-token",
    );

    useAuthStore.setState({
      user: {
        id: 1,
        username: "emilys",
        email: "emily@example.com",
        firstName: "Emily",
        lastName: "Johnson",
      },
      accessToken: "expired-access-token",
      refreshToken: "test-refresh-token",
      isAuthenticated: true,
      isInitializing: false,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("refreshes the token and retries a failed request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 401,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
            id: 1,
            username: "emilys",
            email: "emily@example.com",
            firstName: "Emily",
            lastName: "Johnson",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 1,
            title: "Retry succeeded",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    globalThis.fetch = fetchMock;

    const response = await apiClient("/posts/1");

    expect(response.status).toBe(200);

    expect(fetchMock).toHaveBeenCalledTimes(3);

    expect(
      fetchMock.mock.calls[0][1]?.headers,
    ).toBeDefined();

    expect(
      fetchMock.mock.calls[2][1]?.headers,
    ).toBeDefined();

    expect(
      useAuthStore.getState().accessToken,
    ).toBe("new-access-token");

    expect(
      useAuthStore.getState().refreshToken,
    ).toBe("new-refresh-token");
  });
});