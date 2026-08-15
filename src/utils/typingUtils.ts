import { KeyPerformance, TypingStats, SessionResult } from "../types";

/**
 * Calculates Words Per Minute (WPM)
 * Standard formula: (Total Characters typed / 5) / (Time in Minutes)
 */
export function calculateWpm(typedLength: number, timeSec: number): number {
  if (timeSec <= 0) return 0;
  const minutes = timeSec / 60;
  const words = typedLength / 5;
  return Math.round(words / minutes);
}

/**
 * Calculates Net WPM (accounting for errors)
 */
export function calculateNetWpm(correctChars: number, timeSec: number): number {
  if (timeSec <= 0) return 0;
  const minutes = timeSec / 60;
  const correctWords = correctChars / 5;
  return Math.max(0, Math.round(correctWords / minutes));
}

/**
 * Calculates Accuracy Percentage
 */
export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 100;
  return Number(((correctChars / totalChars) * 100).toFixed(1));
}

/**
 * Calculates Consistency percentage based on variance of interval typing speeds
 */
export function calculateConsistency(intervalWpms: number[]): number {
  if (intervalWpms.length <= 1) return 95;

  const avg = intervalWpms.reduce((a, b) => a + b, 0) / intervalWpms.length;
  if (avg === 0) return 100;

  const variance =
    intervalWpms.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / intervalWpms.length;
  const stdDev = Math.sqrt(variance);
  const cv = (stdDev / avg) * 100;

  const consistency = Math.max(10, Math.min(100, Math.round(100 - cv)));
  return consistency;
}

/**
 * Maps key stats to keyboard heatmap color indicators
 */
export function generateKeyHeatmapData(): KeyPerformance[] {
  const keys = "qwertyuiopasdfghjklzxcvbnm".split("");

  // Sample realistic performance distribution
  const defaultPerformance: Record<
    string,
    { presses: number; errors: number; avgLatencyMs: number }
  > = {
    e: { presses: 340, errors: 4, avgLatencyMs: 95 },
    t: { presses: 280, errors: 3, avgLatencyMs: 102 },
    a: { presses: 260, errors: 5, avgLatencyMs: 108 },
    o: { presses: 250, errors: 6, avgLatencyMs: 110 },
    i: { presses: 240, errors: 4, avgLatencyMs: 105 },
    n: { presses: 220, errors: 8, avgLatencyMs: 125 },
    s: { presses: 210, errors: 7, avgLatencyMs: 118 },
    h: { presses: 190, errors: 6, avgLatencyMs: 122 },
    r: { presses: 185, errors: 5, avgLatencyMs: 115 },
    d: { presses: 160, errors: 4, avgLatencyMs: 112 },
    l: { presses: 150, errors: 5, avgLatencyMs: 130 },
    c: { presses: 130, errors: 9, avgLatencyMs: 145 },
    u: { presses: 120, errors: 4, avgLatencyMs: 120 },
    m: { presses: 110, errors: 8, avgLatencyMs: 142 },
    w: { presses: 95, errors: 6, avgLatencyMs: 138 },
    f: { presses: 90, errors: 5, avgLatencyMs: 125 },
    g: { presses: 85, errors: 7, avgLatencyMs: 140 },
    y: { presses: 80, errors: 9, avgLatencyMs: 165 },
    p: { presses: 75, errors: 14, avgLatencyMs: 195 }, // Weak key example
    b: { presses: 70, errors: 8, avgLatencyMs: 155 },
    v: { presses: 65, errors: 6, avgLatencyMs: 148 },
    k: { presses: 60, errors: 7, avgLatencyMs: 160 },
    j: { presses: 50, errors: 5, avgLatencyMs: 150 },
    x: { presses: 35, errors: 8, avgLatencyMs: 185 },
    q: { presses: 25, errors: 6, avgLatencyMs: 190 },
    z: { presses: 20, errors: 9, avgLatencyMs: 210 }, // Weak key example
  };

  return keys.map((char) => {
    const stats = defaultPerformance[char] || { presses: 50, errors: 5, avgLatencyMs: 140 };
    const accuracy = calculateAccuracy(stats.presses - stats.errors, stats.presses);

    let heatLevel: KeyPerformance["heatLevel"] = "optimal";
    if (accuracy < 85 || stats.avgLatencyMs > 180) {
      heatLevel = "hot"; // Needs attention
    } else if (accuracy < 92 || stats.avgLatencyMs > 145) {
      heatLevel = "warm";
    } else if (stats.presses > 200 && accuracy >= 95) {
      heatLevel = "cool"; // Excellent master
    }

    return {
      key: char,
      displayLabel: char.toUpperCase(),
      presses: stats.presses,
      errors: stats.errors,
      avgLatencyMs: stats.avgLatencyMs,
      accuracy,
      heatLevel,
    };
  });
}

/**
 * Returns rule-based feedback summary based on test performance metrics
 */
export function generatePerformanceFeedback(
  wpm: number,
  accuracy: number,
  consistency: number,
  errorKeysCount: number,
): { title: string; advice: string; focusType: "speed" | "accuracy" | "consistency" | "mastery" } {
  if (accuracy < 92) {
    return {
      title: "Focus on Precision & Hesitation Reduction",
      advice:
        "Your speed is developing, but accuracy dropped below 92%. Slow down slightly to build clean muscle memory — accuracy naturally translates into effortless velocity.",
      focusType: "accuracy",
    };
  } else if (wpm >= 80 && accuracy >= 97) {
    return {
      title: "Master Class Speed & Precision",
      advice:
        "Outstanding flow execution! You maintain elite velocity alongside laser accuracy. Challenge yourself with advanced code syntax or custom technical vocabulary.",
      focusType: "mastery",
    };
  } else if (consistency < 75) {
    return {
      title: "Smooth Out Cadence & Rhythm",
      advice:
        "You have good bursts of speed, but your rhythm fluctuated across intervals. Aim for steady, metronome-like pacing between keystrokes to minimize fatigue.",
      focusType: "consistency",
    };
  } else if (accuracy >= 97 && wpm < 50) {
    return {
      title: "High Precision Baseline — Ready for Speed",
      advice:
        "Your accuracy is nearly perfect! Now you can safely push your finger speed and trust your muscle memory without overthinking individual key reaches.",
      focusType: "speed",
    };
  }

  return {
    title: "Solid Balanced Performance",
    advice:
      "Great overall session with strong control. Keep up daily targeted drills to isolate weak key reaches and build stamina.",
    focusType: "mastery",
  };
}

/**
 * Returns finger zone mapping for proper touch typing placement
 */
export function getFingerForKey(
  key: string,
  layout: "qwerty" | "dvorak" | "colemak" = "qwerty",
): { finger: string; side: "left" | "right"; color: string } {
  const k = key.toLowerCase();

  if (["1", "q", "a", "z"].includes(k))
    return { finger: "Left Pinky", side: "left", color: "bg-kfa-800" };
  if (["2", "w", "s", "x"].includes(k))
    return { finger: "Left Ring", side: "left", color: "bg-kfa-700" };
  if (["3", "e", "d", "c"].includes(k))
    return { finger: "Left Middle", side: "left", color: "bg-kfa-600" };
  if (["4", "5", "r", "t", "f", "g", "v", "b"].includes(k))
    return { finger: "Left Index", side: "left", color: "bg-kfa-500" };
  if (["6", "7", "y", "u", "h", "j", "n", "m"].includes(k))
    return { finger: "Right Index", side: "right", color: "bg-kfa-400" };
  if (["8", "i", "k", ","].includes(k))
    return { finger: "Right Middle", side: "right", color: "bg-kfa-300" };
  if (["9", "o", "l", "."].includes(k))
    return { finger: "Right Ring", side: "right", color: "bg-kfn-400" };
  if (["0", "-", "=", "p", "[", "]", ";", "'", "/", "enter", "backspace"].includes(k))
    return { finger: "Right Pinky", side: "right", color: "bg-kfn-300" };
  if (k === " ") return { finger: "Thumb", side: "left", color: "bg-kfn-500" };

  return { finger: "Index / Pinky", side: "left", color: "bg-kfa-400" };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins > 0 ? `${mins}m ` : ""}${secs}s`;
}
