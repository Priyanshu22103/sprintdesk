import { useMemo } from "react";

import { useBoardStore } from "../stores/boardStore";

export default function SprintStats() {
  const tasks = useBoardStore(
    (state) => state.tasks,
  );

  const stats = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.status === "done",
    ).length;

    const inProgress = tasks.filter(
      (task) =>
        task.status === "in-progress",
    ).length;

    const highPriority = tasks.filter(
      (task) => task.priority === "high",
    ).length;

    const completion =
      total === 0
        ? 0
        : Math.round(
            (completed / total) * 100,
          );

    return {
      total,
      completed,
      inProgress,
      highPriority,
      completion,
    };
  }, [tasks]);

  const cards = [
    {
      label: "Total tasks",
      value: stats.total,
      description: "Across this sprint",
      icon: "📋",
    },
    {
      label: "Completed",
      value: stats.completed,
      description: `${stats.completion}% complete`,
      icon: "✓",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      description: "Currently active",
      icon: "⚡",
    },
    {
      label: "High priority",
      value: stats.highPriority,
      description: "Needs attention",
      icon: "!",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 ${
            index === 0
              ? "border-violet-100 bg-violet-50/70"
              : index === 1
                ? "border-emerald-100 bg-emerald-50/70"
                : index === 2
                  ? "border-sky-100 bg-sky-50/70"
                  : "border-amber-100 bg-amber-50/70"
          }`}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-slate-600">
              {card.label}
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-600 shadow-sm">
              {card.icon}
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {card.value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}