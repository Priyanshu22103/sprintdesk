interface JsonPlaceholderPost {
  id: number;
  title: string;
  body: string;
  userId: number;
}

const NOTIFICATION_API =
  "https://jsonplaceholder.typicode.com/posts?_limit=5";

export async function fetchNotifications(): Promise<
  JsonPlaceholderPost[]
> {
  const response = await fetch(
    NOTIFICATION_API,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch notifications",
    );
  }

  return response.json();
}