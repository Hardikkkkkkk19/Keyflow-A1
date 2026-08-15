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

const CANDIDATE_MODELS = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCapacityError(err: any): boolean {
  const errMsg = (err?.message || "").toLowerCase();
  const errStatus = (err?.status || "").toString().toLowerCase();
  const errCode = err?.code || err?.status;

  return (
    errCode === 503 ||
    errCode === 429 ||
    errStatus.includes("unavailable") ||
    errStatus.includes("resource_exhausted") ||
    errMsg.includes("high demand") ||
    errMsg.includes("temporar") ||
    errMsg.includes("503") ||
    errMsg.includes("429") ||
    errMsg.includes("quota")
  );
}

/**
 * Intelligent telemetry-driven fallback generator for when Gemini API experiences temporary upstream capacity spikes.
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

  // General Comprehensive Coaching Summary
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

export async function processCoachRequest(payload: CoachRequestPayload): Promise<string> {
  const { message, userContext, history } = payload;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // If API key is not present, provide rich telemetry-driven response seamlessly
    return generateTelemetryFallbackReply(message, userContext);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const systemInstruction = `You are KEYFLOW AI Typing Coach, an expert typing instructor and ergonomic analyst.
Analyze the user's typing telemetry (WPM, accuracy, weak keys, consistency, code accuracy) and offer actionable, encouraging, concise advice.
User Name: ${userContext?.user?.displayName || "Typist"}
Overview: Average ${userContext?.overview?.avgWpm || 0} WPM, ${userContext?.overview?.avgAccuracy || 0}% Accuracy, ${userContext?.overview?.totalSessions || 0} Total Sessions, Peak ${userContext?.overview?.highestWpm || 0} WPM.
Weak Keys: ${JSON.stringify(userContext?.weakKeys || [])}
Level: ${userContext?.progress?.level || 1}, Streak: ${userContext?.progress?.streakDays || 0} days.
Coding Stats: ${JSON.stringify(userContext?.coding || {})}`;

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

  // Attempt across candidate models with automatic retry & fallback
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
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
        lastError = err;
        console.warn(
          `[AI Coach] Model ${model} attempt ${attempt + 1} notice:`,
          err?.message || err,
        );

        if (isCapacityError(err)) {
          // Short delay before next attempt/model
          await sleep(350 * (attempt + 1));
        } else {
          // If not a capacity error (e.g. fatal syntax), switch to next model immediately
          break;
        }
      }
    }
  }

  // If all candidate models encounter capacity/temporary issues, gracefully return a tailored telemetry response
  console.warn(
    "[AI Coach] Gemini models temporarily unavailable under high demand. Falling back to internal telemetry diagnostic engine.",
    lastError?.message,
  );

  return generateTelemetryFallbackReply(message, userContext);
}
