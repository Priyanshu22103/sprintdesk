import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type {
  DragEndEvent,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useQuery } from "@tanstack/react-query";

import AddTaskModal from "../components/AddTaskModal";
import SprintStats from "../components/SprintStats";
import TaskDrawer from "../components/TaskDrawer";

import { fetchSprintTasks } from "../services/taskApi";

import { useBoardStore } from "../stores/boardStore";

import type {
  SprintTask,
  TaskPriority,
  TaskStatus,
} from "../types/task";

const columns: {
  id: TaskStatus;
  title: string;
}[] = [
  {
    id: "backlog",
    title: "Backlog",
  },
  {
    id: "in-progress",
    title: "In Progress",
  },
  {
    id: "review",
    title: "Review",
  },
  {
    id: "done",
    title: "Done",
  },
];

function isTaskStatus(
  value: unknown,
): value is TaskStatus {
  return columns.some(
    (column) => column.id === value,
  );
}

function Board() {
  const tasks = useBoardStore(
    (state) => state.tasks,
  );

  const setTasks = useBoardStore(
    (state) => state.setTasks,
  );

  const moveTask = useBoardStore(
    (state) => state.moveTask,
  );

  const [activeTask, setActiveTask] =
    useState<SprintTask | null>(null);

  const [selectedTask, setSelectedTask] =
    useState<SprintTask | null>(null);

  const [showAddTask, setShowAddTask] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState<TaskPriority | "all">("all");

  /*
   * TanStack Query handles the server request.
   *
   * Zustand remains responsible for the actual
   * editable/persisted board state.
   */
  const {
    data: serverTasks,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["sprint-tasks"],
    queryFn: fetchSprintTasks,
    staleTime: 5 * 60 * 1000,
    enabled: tasks.length === 0,
  });

  /*
   * Copy API data into the persistent Zustand store.
   */
  useEffect(() => {
    if (
      tasks.length === 0 &&
      serverTasks &&
      serverTasks.length > 0
    ) {
      setTasks(serverTasks);
    }
  }, [
    tasks.length,
    serverTasks,
    setTasks,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const filteredTasks = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title
          .toLowerCase()
          .includes(query) ||
        task.assignee
          .toLowerCase()
          .includes(query);

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesPriority
      );
    });
  }, [
    tasks,
    search,
    priorityFilter,
  ]);

  const groupedTasks = useMemo(() => {
    return columns.reduce(
      (result, column) => {
        result[column.id] =
          filteredTasks.filter(
            (task) =>
              task.status === column.id,
          );

        return result;
      },
      {} as Record<
        TaskStatus,
        SprintTask[]
      >,
    );
  }, [filteredTasks]);

  const handleDragStart = useCallback(
    ({
      active,
    }: {
      active: {
        id: string | number;
      };
    }) => {
      const task = tasks.find(
        (item) =>
          item.id === Number(active.id),
      );

      setActiveTask(task ?? null);
    },
    [tasks],
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveTask(null);

      if (!over) {
        return;
      }

      const taskId = Number(active.id);

      const draggedTask = tasks.find(
        (task) => task.id === taskId,
      );

      if (!draggedTask) {
        return;
      }

      /*
       * The drop target can be:
       *
       * 1. A column
       * 2. Another task
       */
      let targetStatus:
        | TaskStatus
        | undefined;

      if (isTaskStatus(over.id)) {
        targetStatus =
          over.id;
      } else {
        const overTask = tasks.find(
          (task) =>
            task.id === Number(over.id),
        );

        targetStatus =
          overTask?.status;
      }

      if (!targetStatus) {
        return;
      }

      /*
       * Find the target column tasks excluding
       * the task currently being moved.
       */
      const targetColumnTasks =
        tasks.filter(
          (task) =>
            task.status ===
              targetStatus &&
            task.id !== taskId,
        );

      let newIndex =
        targetColumnTasks.length;

      /*
       * If dropped over another task,
       * insert at that task's position.
       */
      if (!isTaskStatus(over.id)) {
        const overTaskIndex =
          targetColumnTasks.findIndex(
            (task) =>
              task.id === Number(over.id),
          );

        if (overTaskIndex !== -1) {
          newIndex = overTaskIndex;
        }
      }

      /*
       * Moving/reordering is handled by Zustand.
       */
      moveTask(
        taskId,
        targetStatus,
        newIndex,
      );
    },
    [tasks, moveTask],
  );

  function handleCloseTaskDrawer() {
    setSelectedTask(null);
  }

  /*
   * Initial loading state.
   */
  if (
    isLoading &&
    tasks.length === 0
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="text-center"
          role="status"
          aria-live="polite"
        >
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"
            aria-hidden="true"
          />

          <p className="mt-4 text-sm text-slate-400">
            Loading sprint tasks...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (
    isError &&
    tasks.length === 0
  ) {
    return (
      <div
        className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-300"
        role="alert"
      >
        <p className="font-medium">
          Unable to load sprint tasks.
        </p>

        <p className="mt-1 text-sm text-red-300/70">
          Please check your connection
          and refresh the page.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-400">
            Sprint workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Sprint Board
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track work, priorities and
            progress across your sprint.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowAddTask(true)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          <span
            className="text-lg leading-none"
            aria-hidden="true"
          >
            +
          </span>

          Add task
        </button>
      </div>

      {/* Background fetching indicator */}

      {isFetching &&
        tasks.length > 0 && (
          <p
            className="text-xs text-slate-500"
            role="status"
          >
            Syncing sprint data...
          </p>
        )}

      {/* Statistics */}

      <SprintStats />

      {/* Filters */}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:flex-row">
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          >
            🔍
          </span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search tasks or assignees..."
            aria-label="Search tasks or assignees"
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(
              event.target
                .value as
                | TaskPriority
                | "all",
            )
          }
          aria-label="Filter by priority"
          className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">
            All priorities
          </option>

          <option value="high">
            High priority
          </option>

          <option value="medium">
            Medium priority
          </option>

          <option value="low">
            Low priority
          </option>
        </select>
      </div>

      {/* Result count */}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing{" "}
          {filteredTasks.length} of{" "}
          {tasks.length} tasks
        </span>

        {(search ||
          priorityFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPriorityFilter("all");
            }}
            className="text-indigo-400 hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Kanban Board */}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => {
            const columnTasks =
              groupedTasks[column.id];

            return (
              <BoardColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={columnTasks}
                onOpenTask={
                  setSelectedTask
                }
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-72 rotate-2 rounded-xl border border-indigo-500/40 bg-slate-900 p-4 shadow-2xl">
              <p className="text-sm font-medium text-white">
                {activeTask.title}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {activeTask.priority} ·{" "}
                {activeTask.assignee}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Drawer */}

      {selectedTask !== null && (
        <TaskDrawer
          task={selectedTask}
          onClose={
            handleCloseTaskDrawer
          }
        />
      )}

      {/* Add Task Modal */}

      <AddTaskModal
        open={showAddTask}
        onClose={() =>
          setShowAddTask(false)
        }
      />
    </section>
  );
}

function BoardColumn({
  id,
  title,
  tasks,
  onOpenTask,
}: {
  id: TaskStatus;
  title: string;
  tasks: SprintTask[];
  onOpenTask: (
    task: SprintTask,
  ) => void;
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id,
    data: {
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[500px] rounded-2xl border p-4 transition ${
        isOver
          ? "border-indigo-500/60 bg-indigo-500/5"
          : "border-slate-800 bg-slate-900/70"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">
          {title}
        </h2>

        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center text-xs text-slate-600">
            No matching tasks
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTask
              key={task.id}
              task={task}
              onOpen={() =>
                onOpenTask(task)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableTask({
  task,
  onOpen,
}: {
  task: SprintTask;
  onOpen: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      status: task.status,
    },
  });

  const {
    setNodeRef: setDroppableNodeRef,
  } = useDroppable({
    id: task.id,
    data: {
      status: task.status,
    },
  });

  /*
   * Both draggable and droppable need access
   * to the same DOM element.
   */
  const setNodeRef = useCallback(
    (node: HTMLElement | null) => {
      setDraggableNodeRef(node);
      setDroppableNodeRef(node);
    },
    [
      setDraggableNodeRef,
      setDroppableNodeRef,
    ],
  );

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const combinedListeners:
    | DraggableSyntheticListeners
    | undefined = listeners;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...combinedListeners}
      {...attributes}
      tabIndex={0}
      onDoubleClick={onOpen}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Open task ${task.title}`}
      className={`cursor-grab rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isDragging
          ? "opacity-40"
          : "hover:-translate-y-0.5 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-5 text-slate-100">
          {task.title}
        </h3>

        <span className="shrink-0 rounded-full bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-indigo-300">
          {task.priority}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {task.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          {task.assignee}
        </span>

        <span>
          {task.dueDate ||
            "No due date"}
        </span>
      </div>
    </article>
  );
}

export default Board;