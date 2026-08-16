export type TaskStatus =
  | "backlog"
  | "in-progress"
  | "review"
  | "done";

export type TaskPriority =
  | "low"
  | "medium"
  | "high";

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface SprintTask {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  completedAt?: string;
  comments: TaskComment[];
}