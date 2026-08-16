import { useMemo } from "react";

import { useBoardStore } from "../stores/boardStore";

function Analytics() {
  const tasks = useBoardStore(
    (state) => state.tasks,
  );

  const analytics = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.status === "done",
    ).length;

    const backlog = tasks.filter(
      (task) => task.status === "backlog",
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in-progress",
    ).length;

    const review = tasks.filter(
      (task) => task.status === "review",
    ).length;

    const high = tasks.filter(
      (task) => task.priority === "high",
    ).length;

    const medium = tasks.filter(
      (task) => task.priority === "medium",
    ).length;

    const low = tasks.filter(
      (task) => task.priority === "low",
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
      backlog,
      inProgress,
      review,
      high,
      medium,
      low,
      completion,
    };
  }, [tasks]);

  return (
    <main className="space-y-8">
      {/* Header */}

      <div>
        <p className="text-sm font-medium text-indigo-400">
          Sprint insights
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Analytics
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Understand sprint progress, workload and
          task priorities.
        </p>
      </div>

      {/* Overview */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total tasks"
          value={analytics.total}
        />

        <MetricCard
          label="Completed"
          value={analytics.completed}
        />

        <MetricCard
          label="In progress"
          value={analytics.inProgress}
        />

        <MetricCard
          label="Completion"
          value={`${analytics.completion}%`}
        />
      </div>

      {/* Progress */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Sprint completion
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tasks completed versus remaining
            </p>
          </div>

          <span className="text-2xl font-bold text-indigo-600">
            {analytics.completion}%
          </span>
        </div>

        <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${analytics.completion}%`,
            }}
          />
        </div>

        <div className="mt-4 flex justify-between text-xs text-slate-500">
          <span>
            {analytics.completed} completed
          </span>

          <span>
            {analytics.total -
              analytics.completed}{" "}
            remaining
          </span>
        </div>
      </section>

      {/* Status + Priority */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status breakdown */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Task status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Distribution across the workflow
          </p>

          <div className="mt-6 space-y-5">
            <StatusRow
              label="Backlog"
              value={analytics.backlog}
              total={analytics.total}
            />

            <StatusRow
              label="In Progress"
              value={analytics.inProgress}
              total={analytics.total}
            />

            <StatusRow
              label="Review"
              value={analytics.review}
              total={analytics.total}
            />

            <StatusRow
              label="Done"
              value={analytics.completed}
              total={analytics.total}
            />
          </div>
        </section>

        {/* Priority breakdown */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Priority breakdown
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Tasks grouped by priority
          </p>

          <div className="mt-6 space-y-5">
            <PriorityRow
              label="High"
              value={analytics.high}
              total={analytics.total}
            />

            <PriorityRow
              label="Medium"
              value={analytics.medium}
              total={analytics.total}
            />

            <PriorityRow
              label="Low"
              value={analytics.low}
              total={analytics.total}
            />
          </div>
        </section>
      </div>

      {/* Insights */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Sprint insights
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Insight
            title="Completion rate"
            value={`${analytics.completion}%`}
            description={
              analytics.completion >= 70
                ? "The sprint is progressing well."
                : "There is still significant work remaining."
            }
          />

          <Insight
            title="Active work"
            value={String(
              analytics.inProgress,
            )}
            description="Tasks currently being worked on."
          />

          <Insight
            title="Attention needed"
            value={String(
              analytics.high,
            )}
            description="High-priority tasks requiring attention."
          />
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="text-slate-500">
          {value} · {percentage}%
        </span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function PriorityRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="text-slate-500">
          {value} · {percentage}%
        </span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function Insight({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default Analytics;