import { useState } from "react";

import { useBoardStore } from "../stores/boardStore";

import type {
  TaskPriority,
  TaskStatus,
} from "../types/task";

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTaskModal({
  open,
  onClose,
}: AddTaskModalProps) {
  const addTask = useBoardStore(
    (state) => state.addTask,
  );

  const [title, setTitle] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("medium");
  const [assignee, setAssignee] =
    useState("Alex");
  const [dueDate, setDueDate] =
    useState("");

  if (!open) {
    return null;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const task = {
      id: Date.now(),
      title: trimmedTitle,
      description:
        "New task created in SprintDesk.",
      status: "backlog" as TaskStatus,
      priority,
      assignee,
      dueDate,
      comments: [],
    };

    addTask(task);

    setTitle("");
    setPriority("medium");
    setAssignee("Alex");
    setDueDate("");

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-2xl shadow-violet-950/20"
      >
        <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
            Sprint workspace
          </p>

          <h2
            id="add-task-title"
            className="mt-1 text-xl font-semibold text-slate-900"
          >
            Create task
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add something new to your sprint.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label
              htmlFor="new-task-title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Task title
            </label>

            <input
              id="new-task-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Build analytics dashboard"
              required
              autoFocus
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="new-task-priority"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Priority
              </label>

              <select
                id="new-task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as TaskPriority,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="new-task-assignee"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Assignee
              </label>

              <input
                id="new-task-assignee"
                value={assignee}
                onChange={(event) =>
                  setAssignee(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="new-task-date"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Due date
            </label>

            <input
              id="new-task-date"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
          >
            Create task
          </button>
        </div>
      </form>
    </div>
  );
}