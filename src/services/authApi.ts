import type { LoginResponse } from "../types/auth";

const AUTH_URL = "https://dummyjson.com/auth/login";

export async function loginRequest(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      expiresInMins: 30,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ?? "Invalid username or password",
    );
  }

  return response.json();
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<LoginResponse> {
  const response = await fetch(
    "https://dummyjson.com/auth/refresh",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
        expiresInMins: 30,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Session expired");
  }

  return response.json();
}