import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Notification } from "../types/notification";

interface NotificationState {
  notifications: Notification[];

  addNotification: (
    notification: Notification,
  ) => void;

  markAsRead: (id: number) => void;

  markAllAsRead: () => void;

  clearNotifications: () => void;
}

export const useNotificationStore =
  create<NotificationState>()(
    persist(
      (set) => ({
        notifications: [],

        addNotification: (notification) => {
          set((state) => {
            const exists =
              state.notifications.some(
                (item) =>
                  item.id === notification.id,
              );

            if (exists) {
              return state;
            }

            return {
              notifications: [
                notification,
                ...state.notifications,
              ].slice(0, 20),
            };
          });
        },

        markAsRead: (id) => {
          set((state) => ({
            notifications:
              state.notifications.map(
                (notification) =>
                  notification.id === id
                    ? {
                        ...notification,
                        read: true,
                      }
                    : notification,
              ),
          }));
        },

        markAllAsRead: () => {
          set((state) => ({
            notifications:
              state.notifications.map(
                (notification) => ({
                  ...notification,
                  read: true,
                }),
              ),
          }));
        },

        clearNotifications: () => {
          set({
            notifications: [],
          });
        },
      }),
      {
        name: "sprintdesk-notifications",
      },
    ),
  );