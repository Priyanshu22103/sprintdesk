import type {
  SprintTask,
  TaskPriority,
  TaskStatus,
} from "../types/task";

interface JsonPlaceholderTask {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

const API_URL =
  "https://jsonplaceholder.typicode.com/todos?_limit=30";

const priorities: TaskPriority[] = [
  "low",
  "medium",
  "high",
];

const assignees = [
  "Alex",
  "Maya",
  "Jordan",
  "Sam",
  "Priya",
];

function getStatus(
  task: JsonPlaceholderTask,
  index: number,
): TaskStatus {
  if (task.completed) {
    return "done";
  }

  const statuses: TaskStatus[] = [
    "backlog",
    "in-progress",
    "review",
  ];

  return statuses[
    index % statuses.length
  ];
}

export async function fetchSprintTasks(): Promise<
  SprintTask[]
> {
  const response = await fetch(
    API_URL,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sprint tasks: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as JsonPlaceholderTask[];

  return data.map(
    (task, index) => ({
      id: task.id,

      title:
        task.title.charAt(0).toUpperCase() +
        task.title.slice(1),

      description:
        "Sprint task imported from the project workspace.",

      status: getStatus(
        task,
        index,
      ),

      priority:
        priorities[
          index % priorities.length
        ],

      assignee:
        assignees[
          index % assignees.length
        ],

      dueDate: new Date(
        Date.now() +
          (index + 1) *
            86400000,
      )
        .toISOString()
        .split("T")[0],

      comments: [],
    }),
  );
}