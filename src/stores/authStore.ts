import { create } from "zustand";

import { refreshAccessToken } from "../services/authApi";
import type { AuthUser } from "../types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  login: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => void;

  restoreSession: () => Promise<void>;

  logout: () => void;
}

export const useAuthStore = create<AuthState>(
  (set) => ({
    user: null,

    accessToken: null,

    refreshToken: localStorage.getItem(
      "sprintdesk_refresh_token",
    ),

    isAuthenticated: false,

    isInitializing: true,

    login: (
      user,
      accessToken,
      refreshToken,
    ) => {
      localStorage.setItem(
        "sprintdesk_refresh_token",
        refreshToken,
      );

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isInitializing: false,
      });
    },

    restoreSession: async () => {
      const storedRefreshToken =
        localStorage.getItem(
          "sprintdesk_refresh_token",
        );

      /*
       * No refresh token means there is no
       * existing session.
       */
      if (!storedRefreshToken) {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitializing: false,
        });

        return;
      }

      /*
       * If the user is already authenticated,
       * don't unnecessarily refresh the session.
       */
      const currentState =
        useAuthStore.getState();

      if (currentState.isAuthenticated) {
        set({
          isInitializing: false,
        });

        return;
      }

      try {
        const response =
          await refreshAccessToken(
            storedRefreshToken,
          );

        const user: AuthUser = {
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          image: response.image,
        };

        const newRefreshToken =
          response.refreshToken ??
          storedRefreshToken;

        set({
          user,
          accessToken: response.accessToken,
          refreshToken: newRefreshToken,
          isAuthenticated: true,
          isInitializing: false,
        });

        if (response.refreshToken) {
          localStorage.setItem(
            "sprintdesk_refresh_token",
            response.refreshToken,
          );
        }
      } catch {
        localStorage.removeItem(
          "sprintdesk_refresh_token",
        );

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      }
    },

    logout: () => {
      localStorage.removeItem(
        "sprintdesk_refresh_token",
      );

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    },
  }),
);