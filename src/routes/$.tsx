import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "KEYFLOW — Typing Practice, Drills & Analytics" },
      {
        name: "description",
        content:
          "Practice, drills, challenges, leaderboard and AI coaching inside the KEYFLOW typing workspace.",
      },
      { property: "og:title", content: "KEYFLOW — Typing Practice, Drills & Analytics" },
      {
        property: "og:description",
        content:
          "Practice, drills, challenges, leaderboard and AI coaching inside the KEYFLOW typing workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppShell,
});
