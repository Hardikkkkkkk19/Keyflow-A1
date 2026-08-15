import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { generateEmailContent, EmailTemplateData } from "../utils/emailTemplates";

export interface SendEmailParams extends EmailTemplateData {
  email: string;
}

export async function resolveRecipientEmail(
  authHeader: string | null,
  bodyEmail?: string,
): Promise<string | null> {
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.substring(7).trim();
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (token && supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data } = await supabase.auth.getUser(token);
        if (
          data?.user?.email &&
          typeof data.user.email === "string" &&
          data.user.email.includes("@")
        ) {
          console.log(
            `[Email Auth Verification] Dynamic recipient email resolved from Supabase Auth session: ${data.user.email}`,
          );
          return data.user.email.trim();
        }
      } catch (err) {
        console.warn("[Email Auth Verification Notice] Token resolution fallback:", err);
      }
    }
  }

  if (bodyEmail && typeof bodyEmail === "string" && bodyEmail.includes("@")) {
    return bodyEmail.trim();
  }

  return null;
}

function getValidFromAddress(): string {
  const envFrom = process.env.RESEND_FROM_EMAIL?.trim();

  if (!envFrom) {
    return "KEYFLOW <onboarding@resend.dev>";
  }

  // Extract raw email address from format like "KEYFLOW <user@domain.com>" or "user@domain.com"
  const emailMatch = envFrom.match(/<([^>]+)>/) || [null, envFrom];
  const actualEmail = (emailMatch[1] || envFrom).toLowerCase().trim();

  // Public webmail domains cannot be verified on Resend as custom sender domains
  const unverifiableDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "aol.com",
    "proton.me",
    "protonmail.com",
  ];

  const domain = actualEmail.split("@")[1];
  if (!domain || unverifiableDomains.includes(domain)) {
    console.warn(
      `[Resend Notice] Configured RESEND_FROM_EMAIL (${envFrom}) uses unverified domain '${domain}'. Falling back to 'KEYFLOW <onboarding@resend.dev>'.`,
    );
    return "KEYFLOW <onboarding@resend.dev>";
  }

  if (!envFrom.includes("<")) {
    return `KEYFLOW <${envFrom}>`;
  }

  return envFrom;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  sandboxNotice?: boolean;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { email } = params;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { success: false, error: "Valid recipient email address is required." };
  }

  const cleanEmail = email.trim().toLowerCase();
  // Basic RFC 5322 regex check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: `Invalid recipient email format: '${email}'` };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[Resend Server Service] RESEND_API_KEY is missing in server environment variables.",
    );
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in the server environment.",
    };
  }

  try {
    const fromEmail = getValidFromAddress();
    const { subject, html } = generateEmailContent(params);

    console.log(
      `[Resend Dispatch Request] Type: ${params.type} | Sender: ${fromEmail} | Target Recipient: ${cleanEmail}`,
    );

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "keyflow-applet/1.0",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [cleanEmail],
        subject,
        html,
      }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errObj = responseData?.error || responseData;
      const errName = errObj?.name || responseData?.name || "error";
      const errMsg =
        errObj?.message || responseData?.message || `Resend API returned status ${response.status}`;

      const isSandboxRestriction =
        (errName === "validation_error" || response.status === 403 || response.status === 422) &&
        typeof errMsg === "string" &&
        (errMsg.toLowerCase().includes("testing emails") ||
          errMsg.toLowerCase().includes("own email address") ||
          errMsg.toLowerCase().includes("verify a domain") ||
          errMsg.toLowerCase().includes("domain is not verified") ||
          errMsg.toLowerCase().includes("testing mode"));

      if (isSandboxRestriction) {
        console.warn(
          `[Resend Sandbox Notice] Recipient '${cleanEmail}' is restricted while in testing mode. Delivery to external recipients requires domain verification at resend.com/domains.`,
        );
        return {
          success: false,
          sandboxNotice: true,
          error: errMsg,
        };
      }

      console.warn(`[Resend Notice] ${errName}:`, errMsg);
      return { success: false, error: errMsg };
    }

    const emailId = responseData?.id || responseData?.data?.id;
    console.log(
      `[Resend Email Success] ${params.type} email sent to ${cleanEmail} (ID: ${emailId})`,
    );
    return { success: true, id: emailId };
  } catch (err: any) {
    console.warn("[Resend Notice] Network error during dispatch:", err?.message || err);
    return {
      success: false,
      error: err?.message || "Failed to deliver email through Resend.",
    };
  }
}
