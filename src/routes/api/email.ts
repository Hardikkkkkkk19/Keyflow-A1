import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sendEmail, resolveRecipientEmail } from "../../server/emailService";

export const APIRoute = createAPIFileRoute("/api/email")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();
      const {
        type,
        email: bodyEmail,
        displayName,
        badgeTitle,
        badgeId,
        rewardXp,
        description,
        previousLevel,
        newLevel,
        currentXp,
        streakDays,
      } = body;

      const authHeader = request.headers.get("authorization");
      const recipientEmail = await resolveRecipientEmail(authHeader, bodyEmail);

      if (!recipientEmail || !type) {
        return new Response(
          JSON.stringify({
            error: "Valid recipient email address and notification type are required.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const result = await sendEmail({
        type,
        email: recipientEmail,
        displayName,
        badgeTitle,
        badgeId,
        rewardXp,
        description,
        previousLevel,
        newLevel,
        currentXp,
        streakDays,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({
            success: false,
            delivered: false,
            error: result.error || "Failed to send email.",
            sandboxNotice: result.sandboxNotice || false,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ success: true, delivered: true, id: result.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.warn("[API Email Route Notice]", err?.message || err);
      return new Response(
        JSON.stringify({
          success: false,
          delivered: false,
          error: err?.message || "Internal server error processing email request.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
  },
});
