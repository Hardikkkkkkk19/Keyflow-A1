import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { processCoachRequest } from "./server/coachService";
import { sendEmail, resolveRecipientEmail } from "./server/emailService";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function handleCoachApi(request: Request): Promise<Response> {
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
    return new Response(JSON.stringify({ error: err?.message || "Failed to process AI request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleEmailApi(request: Request): Promise<Response> {
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
    console.warn("[API Email Notice]", err?.message || err);
    return new Response(
      JSON.stringify({
        success: false,
        delivered: false,
        error: err?.message || "Internal server error processing email request.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/coach" && request.method === "POST") {
        return await handleCoachApi(request);
      }
      if (url.pathname === "/api/email" && request.method === "POST") {
        return await handleEmailApi(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
