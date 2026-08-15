import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KEYFLOW — Premium Typing Practice & Analytics" },
      {
        name: "description",
        content:
          "Train typing speed and accuracy with KEYFLOW: real-time telemetry, weak-key drills, AI coaching and deep analytics.",
      },
      { property: "og:title", content: "KEYFLOW — Premium Typing Practice & Analytics" },
      {
        property: "og:description",
        content:
          "Train typing speed and accuracy with KEYFLOW: real-time telemetry, weak-key drills, AI coaching and deep analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppShell,
});
