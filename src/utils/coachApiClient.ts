import { UserCoachContext } from "./coachContextBuilder";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  suggestedAction?: {
    label: string;
    actionType: "drill" | "practice" | "code" | "analytics";
    targetValue?: string;
  };
}

export async function askCoach(
  message: string,
  userContext: UserCoachContext,
  history: ChatMessage[] = [],
): Promise<string> {
  const formattedHistory = history.map((h) => ({
    role: h.role,
    content: h.content,
  }));

  const response = await fetch("/api/coach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      userContext,
      history: formattedHistory,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorDetail = data.error || `Server error (${response.status})`;
    if (typeof errorDetail === "object") {
      errorDetail = errorDetail.message || JSON.stringify(errorDetail);
    }
    throw new Error(errorDetail);
  }

  if (data.error) {
    let errorDetail = data.error;
    if (typeof errorDetail === "object") {
      errorDetail = errorDetail.message || JSON.stringify(errorDetail);
    }
    throw new Error(errorDetail);
  }

  return data.reply || "I processed your query, but no response text was returned.";
}
