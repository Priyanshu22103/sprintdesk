import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  SprintTask,
  TaskStatus,
} from "../types/task";

interface BoardState {
  tasks: SprintTask[];

  setTasks: (
    tasks: SprintTask[],
  ) => void;

  addTask: (
    task: SprintTask,
  ) => void;

  updateTask: (
    id: number,
    updates: Partial<SprintTask>,
  ) => void;

  deleteTask: (
    id: number,
  ) => void;

  moveTask: (
    id: number,
    status: TaskStatus,
    newIndex?: number,
  ) => void;

  addComment: (
    taskId: number,
    text: string,
  ) => void;
}

const demoTasks: SprintTask[] = [];

export const useBoardStore =
  create<BoardState>()(
    persist(
      (set) => ({
        tasks: demoTasks,

        setTasks: (tasks) => {
          set({ tasks });
        },

        addTask: (task) => {
          set((state) => ({
            tasks: [
              ...state.tasks,
              task,
            ],
          }));
        },

        updateTask: (
          id,
          updates,
        ) => {
          set((state) => ({
            tasks:
              state.tasks.map(
                (task) =>
                  task.id === id
                    ? {
                        ...task,
                        ...updates,
                      }
                    : task,
              ),
          }));
        },

        deleteTask: (id) => {
          set((state) => ({
            tasks:
              state.tasks.filter(
                (task) =>
                  task.id !== id,
              ),
          }));
        },

        moveTask: (
          id,
          status,
          newIndex,
        ) => {
          set((state) => {
            const task =
              state.tasks.find(
                (item) =>
                  item.id === id,
              );

            if (!task) {
              return state;
            }

            /*
             * Remove the dragged task first.
             */
            const remainingTasks =
              state.tasks.filter(
                (item) =>
                  item.id !== id,
              );

            /*
             * Get tasks belonging to
             * the destination column.
             */
            const targetColumnTasks =
              remainingTasks.filter(
                (item) =>
                  item.status ===
                  status,
              );

            /*
             * Everything outside the
             * destination column.
             */
            const otherTasks =
              remainingTasks.filter(
                (item) =>
                  item.status !==
                  status,
              );

            const updatedTask: SprintTask =
              {
                ...task,
                status,
              };

            /*
             * Keep index inside bounds.
             */
            const safeIndex =
              Math.max(
                0,
                Math.min(
                  newIndex ??
                    targetColumnTasks.length,
                  targetColumnTasks.length,
                ),
              );

            /*
             * Insert task at requested position.
             */
            targetColumnTasks.splice(
              safeIndex,
              0,
              updatedTask,
            );

            /*
             * Keep all non-target columns
             * followed by the destination
             * column.
             *
             * Column rendering is based on
             * status, so each column still
             * displays correctly.
             */
            return {
              tasks: [
                ...otherTasks,
                ...targetColumnTasks,
              ],
            };
          });
        },

        addComment: (
          taskId,
          text,
        ) => {
          set((state) => ({
            tasks:
              state.tasks.map(
                (task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        comments: [
                          ...task.comments,
                          {
                            id: crypto.randomUUID(),
                            author: "You",
                            text,
                            createdAt:
                              new Date().toISOString(),
                          },
                        ],
                      }
                    : task,
              ),
          }));
        },
      }),
      {
        name: "sprintdesk-board",
      },
    ),
  );