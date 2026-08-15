import { GoogleGenAI } from "@google/genai";

interface CoachRequestPayload {
  message: string;
  userContext?: {
    user?: { displayName?: string };
    overview?: {
      avgWpm?: number;
      avgAccuracy?: number;
      totalSessions?: number;
      highestWpm?: number;
    };
    weakKeys?: string[];
    progress?: { level?: number; streakDays?: number; totalXp?: number };
    coding?: { codeAvgWpm?: number; codeAvgAcc?: number; totalCodeSessions?: number };
    recentSessions?: Array<{ wpm: number; accuracy: number; date: string; mode?: string }>;
    hasEnoughData?: boolean;
  };
  history?: Array<{ role: "user" | "assistant" | "model"; content: string }>;
}

const GROQ_PRIMARY_MODEL = "llama-3.3-70b-versatile";
const GROQ_FAST_FALLBACK_MODEL = "llama-3.1-8b-instant";

const GEMINI_CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3.7-flash",
  "gemini-3.1-flash-lite",
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSystemInstruction(userContext?: CoachRequestPayload["userContext"]): string {
  const name = userContext?.user?.displayName || "Typist";
  const avgWpm = Math.round(userContext?.overview?.avgWpm || 0);
  const avgAcc = Number((userContext?.overview?.avgAccuracy || 0).toFixed(1));
  const totalSessions = userContext?.overview?.totalSessions || 0;
  const bestWpm = userContext?.overview?.highestWpm || avgWpm;
  const weakKeys = userContext?.weakKeys || [];
  const level = userContext?.progress?.level || 1;
  const streak = userContext?.progress?.streakDays || 0;
  const coding = userContext?.coding || {};
  const recentSessions = (userContext?.recentSessions || []).slice(0, 5);

  return `You are KEYFLOW AI Typing Coach, an expert typing instructor, biomechanical typing analyst, and speed optimizer.
Analyze the user's real-time typing telemetry and provide highly actionable, concise, encouraging, and technically precise advice.

USER TELEMETRY CONTEXT:
- Name: ${name}
- Average Speed: ${avgWpm} WPM (Peak: ${bestWpm} WPM)
- Average Accuracy: ${avgAcc}%
- Total Completed Sessions: ${totalSessions}
- Current Level: ${level} (${streak}-day practice streak)
- Weak Keys: ${weakKeys.length > 0 ? `[${weakKeys.join(", ")}]` : "None detected yet"}
- Coding Performance: ${coding.codeAvgWpm ? `${Math.round(coding.codeAvgWpm)} WPM @ ${(coding.codeAvgAcc || 0).toFixed(1)}% accuracy` : "No coding sessions logged yet"}
- Recent 5 Sessions: ${recentSessions.length > 0 ? JSON.stringify(recentSessions) : "N/A"}

COACHING DIRECTIVES:
1. Always ground your advice in the user's actual telemetry metrics above.
2. Keep responses focused, structured (using clean markdown headings and bullet points), and immediately applicable.
3. If weak keys are present, recommend finger positioning adjustments and isolation drills.
4. If accuracy is below 95%, emphasize rhythmic cadence and reducing backspaces over raw velocity.
5. Be supportive, motivating, and professional.`;
}

/**
 * Primary AI Provider: Groq Cloud API with ultra-fast inference
 */
async function callGroqCoach(
  payload: CoachRequestPayload,
  groqApiKey: string,
): Promise<string | null> {
  const { message, userContext, history } = payload;
  const systemContent = buildSystemInstruction(userContext);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemContent },
  ];

  if (history && Array.isArray(history)) {
    for (const h of history.slice(-8)) {
      messages.push({
        role: h.role === "assistant" || h.role === "model" ? "assistant" : "user",
        content: h.content,
      });
    }
  }

  messages.push({
    role: "user",
    content: message,
  });

  const modelsToTry = [GROQ_PRIMARY_MODEL, GROQ_FAST_FALLBACK_MODEL];

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(`[Groq AI Coach] Model ${model} HTTP ${response.status}:`, errorText);
        // If rate limited or service error, continue to fast fallback model or Gemini
        continue;
      }

      const data = (await response.json()) as any;
      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (reply) {
        return reply;
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.warn(`[Groq AI Coach] Request timed out on model ${model}`);
      } else {
        console.warn(`[Groq AI Coach] Error calling Groq model ${model}:`, err?.message || err);
      }
    }
  }

  return null;
}

/**
 * Secondary AI Provider: Google Gemini API fallback
 */
async function callGeminiCoach(
  payload: CoachRequestPayload,
  geminiApiKey: string,
): Promise<string | null> {
  const { message, userContext, history } = payload;
  const systemInstruction = buildSystemInstruction(userContext);

  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (history && Array.isArray(history)) {
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.role === "assistant" || h.role === "model" ? "model" : "user",
        parts: [{ text: h.content }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text?.trim();
      if (reply) {
        return reply;
      }
    } catch (err: any) {
      console.warn(`[Gemini AI Coach] Model ${model} notice:`, err?.message || err);
      await sleep(80);
    }
  }

  return null;
}

/**
 * Telemetry-driven fallback generator for offline / missing-key states
 */
function generateTelemetryFallbackReply(
  message: string,
  userContext?: CoachRequestPayload["userContext"],
): string {
  const name = userContext?.user?.displayName || "Typist";
  const avgWpm = Math.round(userContext?.overview?.avgWpm || 0);
  const avgAcc = Number((userContext?.overview?.avgAccuracy || 0).toFixed(1));
  const totalSessions = userContext?.overview?.totalSessions || 0;
  const bestWpm = userContext?.overview?.highestWpm || avgWpm;
  const weakKeys = userContext?.weakKeys || [];
  const streak = userContext?.progress?.streakDays || 0;
  const codeWpm = userContext?.coding?.codeAvgWpm;
  const codeAcc = userContext?.coding?.codeAvgAcc;

  const lower = message.toLowerCase();

  if (
    lower.includes("weak key") ||
    lower.includes("mistake") ||
    lower.includes("typo") ||
    lower.includes("error")
  ) {
    if (weakKeys.length > 0) {
      const top3 = weakKeys.slice(0, 3);
      return `Hey ${name}! Telemetry shows your primary weak keys are **[${top3.join(", ")}]**.

### Diagnostic Insights:
- **Missed Key Anchors:** Frequent deceleration and correction strikes on ${top3.map((k) => `\`${k}\``).join(", ")}.
- **Root Cause:** Irregular finger trajectory from the home row anchor position or early finger release.

### Recommended Routine:
1. **Isolated Finger Repeats:** Practice ${top3.map((k) => `\`${k.toLowerCase()}${k.toLowerCase()} ${k.toLowerCase()}e ${k.toLowerCase()}a\``).join(" ")} at a slow, rhythm-focused pace.
2. **Zero-Backspace Rule:** Reduce speed by 15% to maintain 98%+ precision before speeding back up.
3. Use the **Drills** tab to target finger clusters directly.`;
    } else {
      return `Hey ${name}! Your accuracy is currently **${avgAcc}%** across ${totalSessions} sessions. You don't have any severe weak key clusters logged yet! Keep practicing to build more telemetry.`;
    }
  }

  if (
    lower.includes("fast") ||
    lower.includes("speed") ||
    lower.includes("wpm") ||
    lower.includes("burst")
  ) {
    return `Hey ${name}! Your current average is **${avgWpm} WPM** with a personal best of **${bestWpm} WPM**.

### Speed Acceleration Strategy:
1. **Pacing & Cadence:** Aim for rhythmic typing where every keystroke has equal timing, avoiding erratic bursts and stops.
2. **Accuracy Anchor:** Speed naturally unlocks when accuracy stays consistently above 96%. At ${avgAcc}% accuracy, small correction pauses cost up to 10–15 WPM in net throughput.
3. **Sprint Training:** Try 15-second or 30-second sprint sessions to push your raw finger cadence past your comfort zone, then return to 60-second sessions.`;
  }

  if (
    lower.includes("code") ||
    lower.includes("syntax") ||
    lower.includes("programming") ||
    lower.includes("symbol")
  ) {
    const codeStatsText = codeWpm
      ? `Your coding typing speed is currently **${Math.round(codeWpm)} WPM** with **${(codeAcc || 0).toFixed(1)}%** accuracy.`
      : `You haven't logged dedicated coding sessions yet.`;

    return `Hey ${name}! ${codeStatsText}

### Code Agility Checklist:
- **Symbol Reaches:** Focus on smooth right-pinky reaches for \`{\`, \`}\`, \`[\`, \`]\`, and \`;\`.
- **Indentation & Spacing:** Keep hand anchors steady during indentation and operator typing (\`=>\`, \`===\`, \`&&\`).
- Switch to **Code Mode** on the Practice page to drill JavaScript, Python, and SQL snippets!`;
  }

  if (
    lower.includes("drill") ||
    lower.includes("custom") ||
    lower.includes("routine") ||
    lower.includes("exercise")
  ) {
    const topKeys = weakKeys.slice(0, 3);
    const keyString = topKeys.length > 0 ? topKeys.join(" ") : "f j d k";
    return `Here is a custom workout routine tailored to your stats:

### 15-Minute Daily Regimen:
1. **Warmup (3 min):** Home row anchor flow — \`a s d f j k l ;\`
2. **Precision Focus (5 min):** Weak key isolation — \`${keyString}\`
3. **Cadence Building (5 min):** 60-second standard tests aiming for 96%+ accuracy.
4. **Speed Burst (2 min):** Two 15-second high-velocity sprints.

Head over to the **Practice** or **Drills** tab to begin!`;
  }

  return `Hello ${name}! Here is your current typing diagnostic summary:

- **Velocity:** **${avgWpm} WPM** (Peak: ${bestWpm} WPM)
- **Precision:** **${avgAcc}%** Accuracy across ${totalSessions} sessions
- **Consistency:** Level ${userContext?.progress?.level || 1} • ${streak} Day Streak
${weakKeys.length > 0 ? `- **Weak Keys:** [${weakKeys.slice(0, 4).join(", ")}]` : "- **Key Precision:** Balanced distribution"}

### Coach's Recommendation:
${
  avgAcc < 95
    ? `Your primary leverage is **precision**. Slowing down slightly to eliminate backspacing will immediately boost your net WPM.`
    : `Your accuracy is high (${avgAcc}%). You have a solid foundation to push raw keystroke velocity and try shorter sprint intervals!`
}

Feel free to ask me for custom drills, ergonomic advice, or coding practice tips anytime!`;
}

/**
 * Main AI Coach Dispatcher
 * Priority Flow: Groq (Primary) -> Gemini (Secondary Fallback) -> Telemetry Engine (Tertiary Fallback)
 */
export async function processCoachRequest(payload: CoachRequestPayload): Promise<string> {
  const { message, userContext } = payload;
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // 1. Attempt Groq as primary provider if configured
  if (groqApiKey && groqApiKey.trim().length > 0) {
    try {
      const groqReply = await callGroqCoach(payload, groqApiKey.trim());
      if (groqReply) {
        return groqReply;
      }
      console.warn(
        "[AI Coach] Groq primary provider did not return response. Engaging Gemini fallback...",
      );
    } catch (err: any) {
      console.warn("[AI Coach] Groq error:", err?.message || err);
    }
  }

  // 2. Attempt Gemini as secondary provider fallback
  if (geminiApiKey && geminiApiKey.trim().length > 0) {
    try {
      const geminiReply = await callGeminiCoach(payload, geminiApiKey.trim());
      if (geminiReply) {
        return geminiReply;
      }
      console.warn(
        "[AI Coach] Gemini fallback provider did not return response. Engaging Telemetry engine...",
      );
    } catch (err: any) {
      console.warn("[AI Coach] Gemini error:", err?.message || err);
    }
  }

  // 3. Telemetry Diagnostic Engine
  return generateTelemetryFallbackReply(message, userContext);
}
