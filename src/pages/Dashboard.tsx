import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useBoardStore } from "../stores/boardStore";

function Dashboard() {
  const tasks = useBoardStore(
    (state) => state.tasks,
  );

  const stats = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.status === "done",
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in-progress",
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

  const recentTasks = tasks.slice(0, 5);

  return (
    <main className="space-y-8">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-400">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Sprint Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Get a quick overview of your sprint
            progress.
          </p>
        </div>

        <Link
          to="/board"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Open Sprint Board →
        </Link>
      </div>

      {/* Main Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={stats.total}
          description="Tasks in sprint"
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          description={`${stats.completion}% completion`}
        />

        <StatCard
          label="In progress"
          value={stats.inProgress}
          description="Currently active"
        />

        <StatCard
          label="High priority"
          value={stats.highPriority}
          description="Needs attention"
        />
      </div>

      {/* Progress */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Sprint progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overall completion
            </p>
          </div>

          <span className="text-2xl font-bold text-white">
            {stats.completion}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{
              width: `${stats.completion}%`,
            }}
          />
        </div>
      </section>

      {/* Recent Tasks */}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="font-semibold text-white">
              Recent tasks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest work in your sprint
            </p>
          </div>

          <Link
            to="/board"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {recentTasks.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No tasks yet.
            </div>
          ) : (
            recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {task.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Assigned to {task.assignee}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                    {formatStatus(task.status)}
                  </span>

                  <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                    {task.priority}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function formatStatus(status: string) {
  switch (status) {
    case "in-progress":
      return "In Progress";

    case "backlog":
      return "Backlog";

    case "review":
      return "Review";

    case "done":
      return "Done";

    default:
      return status;
  }
}

export default Dashboard;