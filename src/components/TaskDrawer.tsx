import { useState } from "react";

import { useBoardStore } from "../stores/boardStore";

import type {
  SprintTask,
  TaskPriority,
} from "../types/task";

interface TaskDrawerProps {
  task: SprintTask | null;
  onClose: () => void;
}

const priorities: TaskPriority[] = [
  "low",
  "medium",
  "high",
];

export default function TaskDrawer({
  task,
  onClose,
}: TaskDrawerProps) {
  const updateTask = useBoardStore(
    (state) => state.updateTask,
  );

  const deleteTask = useBoardStore(
    (state) => state.deleteTask,
  );

  const addComment = useBoardStore(
    (state) => state.addComment,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [comment, setComment] = useState("");

  if (!task) {
    return null;
  }

  const taskId = task.id;

  function handleSave() {
    const currentTask = task;

    if (!currentTask) {
      return;
    }

    updateTask(taskId, {
      title: title || currentTask.title,
      description:
        description || currentTask.description,
      priority:
        priority || currentTask.priority,
      assignee:
        assignee || currentTask.assignee,
      dueDate:
        dueDate || currentTask.dueDate,
    });

    onClose();
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this task?",
    );

    if (!confirmed) {
      return;
    }

    deleteTask(taskId);
    onClose();
  }

  function handleComment() {
    const value = comment.trim();

    if (!value) {
      return;
    }

    addComment(taskId, value);
    setComment("");
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Task details"
    >
      <button
        type="button"
        aria-label="Close task details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-amber-100 bg-amber-50 shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-amber-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Task details
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-800">
              Edit task
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg px-3 py-2 text-slate-500 transition hover:bg-amber-100 hover:text-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content */}

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Title
            </label>

            <input
              id="task-title"
              value={title || task.title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={
                description || task.description
              }
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-priority"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Priority
              </label>

              <select
                id="task-priority"
                value={
                  priority || task.priority
                }
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as TaskPriority,
                  )
                }
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {priorities.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-assignee"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Assignee
              </label>

              <input
                id="task-assignee"
                value={
                  assignee || task.assignee
                }
                onChange={(event) =>
                  setAssignee(
                    event.target.value,
                  )
                }
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              value={
                dueDate || task.dueDate
              }
              onChange={(event) =>
                setDueDate(
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Comments */}

          <div className="border-t border-amber-200 pt-5">
            <h3 className="text-sm font-bold text-slate-800">
              Comments
            </h3>

            <div className="mt-4 space-y-3">
              {task.comments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No comments yet.
                </p>
              ) : (
                task.comments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-amber-100 bg-white p-3"
                  >
                    <div className="flex justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        {item.author}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {new Date(
                          item.createdAt,
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {item.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target.value,
                  )
                }
                placeholder="Add a comment..."
                className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />

              <button
                type="button"
                onClick={handleComment}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}

        <div className="flex items-center justify-between border-t border-amber-200 bg-amber-50 px-6 py-4">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            Delete
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-amber-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Save changes
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}