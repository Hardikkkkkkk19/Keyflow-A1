import { createAPIFileRoute } from "@tanstack/react-start/api";
import { processCoachRequest } from "../../server/coachService";

export const APIRoute = createAPIFileRoute("/api/coach")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const { message, userContext, history } = body;

      const reply = await processCoachRequest({ message, userContext, history });
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("[API Coach Error]", err);
      return new Response(
        JSON.stringify({ error: err.message || "Failed to process AI request" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
