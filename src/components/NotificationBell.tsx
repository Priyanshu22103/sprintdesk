import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { fetchNotifications } from "../services/notificationApi";

import { useNotificationStore } from "../stores/notificationStore";

function NotificationBell() {
  const notifications =
    useNotificationStore(
      (state) => state.notifications,
    );

  const addNotification =
    useNotificationStore(
      (state) => state.addNotification,
    );

  const markAsRead =
    useNotificationStore(
      (state) => state.markAsRead,
    );

  const markAllAsRead =
    useNotificationStore(
      (state) => state.markAllAsRead,
    );

  const [open, setOpen] =
    useState(false);

  const [toast, setToast] =
    useState<string | null>(null);

  const initializedRef =
    useRef(false);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read,
      ).length,
    [notifications],
  );

  const pollNotifications =
    useCallback(async () => {
      if (document.hidden) {
        return;
      }

      try {
        const posts =
          await fetchNotifications();

        const existingIds = new Set(
          useNotificationStore
            .getState()
            .notifications.map(
              (notification) =>
                notification.id,
            ),
        );

        const newPosts = posts.filter(
          (post) =>
            !existingIds.has(post.id),
        );

        /*
         * Do not show existing API data
         * as notifications on the first poll.
         */
        if (!initializedRef.current) {
          initializedRef.current = true;

          posts.forEach((post) => {
            addNotification({
              id: post.id,
              title: post.title,
              message: post.body,
              createdAt:
                new Date().toISOString(),
              read: true,
            });
          });

          return;
        }

        newPosts.forEach((post) => {
          addNotification({
            id: post.id,
            title: post.title,
            message: post.body,
            createdAt:
              new Date().toISOString(),
            read: false,
          });
        });

        if (
          newPosts.length > 0 &&
          !open
        ) {
          setToast(
            newPosts.length === 1
              ? "New notification received"
              : `${newPosts.length} new notifications received`,
          );
        }
      } catch {
        /*
         * Polling failures are intentionally
         * silent so the dashboard remains usable.
         */
      }
    }, [addNotification, open]);

  useEffect(() => {
    pollNotifications();

    const interval = window.setInterval(
      pollNotifications,
      15_000,
    );

    function handleVisibilityChange() {
      if (!document.hidden) {
        pollNotifications();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [pollNotifications]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        setToast(null);
      },
      4000,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast]);

  function handleOpen() {
    setOpen((current) => !current);
    setToast(null);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${
          unreadCount > 0
            ? `, ${unreadCount} unread`
            : ""
        }`}
        aria-expanded={open}
        onClick={handleOpen}
        className="relative rounded-lg px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <span aria-hidden="true">
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-500">
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      markAsRead(
                        notification.id,
                      )
                    }
                    className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 ${
                      notification.read
                        ? "bg-white"
                        : "bg-indigo-50/60"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          notification.read
                            ? "bg-slate-300"
                            : "bg-indigo-500"
                        }`}
                      />

                      <div className="min-w-0">
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "font-medium text-slate-700"
                              : "font-semibold text-slate-900"
                          }`}
                        >
                          {notification.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {notification.message}
                        </p>

                        <p className="mt-2 text-[10px] text-slate-400">
                          {formatTime(
                            notification.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ),
              )
            )}
          </div>
        </div>
      )}

      {toast && !open && (
        <div
          role="status"
          className="fixed right-4 top-20 z-[70] w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">
              🔔
            </span>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                New notification
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {toast}
              </p>
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() =>
                setToast(null)
              }
              className="text-slate-400 hover:text-slate-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(
  value: string,
) {
  const date = new Date(value);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default NotificationBell;