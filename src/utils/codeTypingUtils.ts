import { CodeLanguage, SessionResult } from "../types";

export type CodeDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface CodeSnippet {
  id: string;
  language: CodeLanguage;
  difficulty: CodeDifficulty;
  title: string;
  code: string;
}

export const CODE_SNIPPETS_DATABASE: Record<CodeLanguage, Record<CodeDifficulty, CodeSnippet[]>> = {
  javascript: {
    Beginner: [
      {
        id: "js-beg-1",
        language: "javascript",
        difficulty: "Beginner",
        title: "Arrow Function & Addition",
        code: "const add = (a, b) => a + b;",
      },
      {
        id: "js-beg-2",
        language: "javascript",
        difficulty: "Beginner",
        title: "Conditional Check",
        code: 'let isReady = true;\nif (isReady) {\n  console.log("System Ready");\n}',
      },
      {
        id: "js-beg-3",
        language: "javascript",
        difficulty: "Beginner",
        title: "Array Declaration",
        code: 'const items = ["alpha", "beta", "gamma"];',
      },
      {
        id: "js-beg-4",
        language: "javascript",
        difficulty: "Beginner",
        title: "Simple For Loop",
        code: "let total = 0;\nfor (let i = 0; i < 5; i++) {\n  total += i;\n}",
      },
    ],
    Intermediate: [
      {
        id: "js-int-1",
        language: "javascript",
        difficulty: "Intermediate",
        title: "Array Filter & Map",
        code: 'const activeNames = users\n  .filter((u) => u.status === "active")\n  .map((u) => u.name.toUpperCase());',
      },
      {
        id: "js-int-2",
        language: "javascript",
        difficulty: "Intermediate",
        title: "Debounce Utility",
        code: "function debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
      },
      {
        id: "js-int-3",
        language: "javascript",
        difficulty: "Intermediate",
        title: "Async Fetch Function",
        code: 'async function fetchUserProfile(userId) {\n  const res = await fetch(`/api/users/${userId}`);\n  if (!res.ok) throw new Error("User not found");\n  return await res.json();\n}',
      },
      {
        id: "js-int-4",
        language: "javascript",
        difficulty: "Intermediate",
        title: "Object Destructuring",
        code: "const { id, title, score = 100, tags = [] } = item || {};",
      },
    ],
    Advanced: [
      {
        id: "js-adv-1",
        language: "javascript",
        difficulty: "Advanced",
        title: "Function Memoization",
        code: "const memoize = (fn) => {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n};",
      },
      {
        id: "js-adv-2",
        language: "javascript",
        difficulty: "Advanced",
        title: "Custom Debounced Hook",
        code: "export function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const handler = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(handler);\n  }, [value, delay]);\n  return debouncedValue;\n}",
      },
      {
        id: "js-adv-3",
        language: "javascript",
        difficulty: "Advanced",
        title: "Promise All Handler",
        code: 'const loadBatch = async (requests) => {\n  const results = await Promise.allSettled(requests.map((req) => req()));\n  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);\n};',
      },
    ],
    Expert: [
      {
        id: "js-exp-1",
        language: "javascript",
        difficulty: "Expert",
        title: "Typed Event Emitter Class",
        code: "class EventEmitter {\n  constructor() {\n    this.listeners = new Map();\n  }\n  on(event, fn) {\n    if (!this.listeners.has(event)) this.listeners.set(event, []);\n    this.listeners.get(event).push(fn);\n  }\n  emit(event, ...data) {\n    const handlers = this.listeners.get(event);\n    if (handlers) handlers.forEach((fn) => fn(...data));\n  }\n}",
      },
      {
        id: "js-exp-2",
        language: "javascript",
        difficulty: "Expert",
        title: "Functional Pipeline Composition",
        code: "const compose = (...fns) => (initial) => fns.reduceRight((acc, fn) => fn(acc), initial);\nconst processData = compose(\n  (arr) => arr.filter(Boolean),\n  (arr) => arr.map((x) => x * 2),\n  (obj) => Object.values(obj)\n);",
      },
    ],
  },
  python: {
    Beginner: [
      {
        id: "py-beg-1",
        language: "python",
        difficulty: "Beginner",
        title: "List & Range",
        code: "numbers = [x * 2 for x in range(10)]\nprint(numbers)",
      },
      {
        id: "py-beg-2",
        language: "python",
        difficulty: "Beginner",
        title: "Type-Annotated Function",
        code: 'def greet(name: str) -> str:\n    return f"Hello, {name}!"',
      },
      {
        id: "py-beg-3",
        language: "python",
        difficulty: "Beginner",
        title: "Dictionary Access",
        code: 'data = {"status": "ok", "code": 200, "active": True}\nif data["code"] == 200:\n    print("Success")',
      },
    ],
    Intermediate: [
      {
        id: "py-int-1",
        language: "python",
        difficulty: "Intermediate",
        title: "List Comprehension with Guard",
        code: 'def filter_active_users(users: list) -> list:\n    return [u for u in users if u.get("is_active") and u.get("score") > 50]',
      },
      {
        id: "py-int-2",
        language: "python",
        difficulty: "Intermediate",
        title: "File Context Manager",
        code: 'import json\nwith open("config.json", "r", encoding="utf-8") as f:\n    config = json.load(f)\nprint(f"Loaded {len(config)} parameters")',
      },
      {
        id: "py-int-3",
        language: "python",
        difficulty: "Intermediate",
        title: "Class Definition",
        code: "class TypingTracker:\n    def __init__(self, target_wpm: float = 80.0):\n        self.target_wpm = target_wpm\n        self.history = []\n\n    def add_session(self, wpm: float) -> None:\n        self.history.append(wpm)",
      },
    ],
    Advanced: [
      {
        id: "py-adv-1",
        language: "python",
        difficulty: "Advanced",
        title: "Async Retry Decorator",
        code: "def async_retry(retries: int = 3, delay: float = 1.0):\n    def decorator(func):\n        async def wrapper(*args, **kwargs):\n            for attempt in range(retries):\n                try:\n                    return await func(*args, **kwargs)\n                except Exception as err:\n                    if attempt == retries - 1:\n                        raise err\n                    await asyncio.sleep(delay)\n        return wrapper\n    return decorator",
      },
      {
        id: "py-adv-2",
        language: "python",
        difficulty: "Advanced",
        title: "Custom Context Manager Class",
        code: 'class TimerContext:\n    def __enter__(self):\n        self.start = time.perf_counter()\n        return self\n\n    def __exit__(self, exc_type, exc_val, exc_tb):\n        self.elapsed = time.perf_counter() - self.start\n        print(f"Elapsed time: {self.elapsed:.4f}s")',
      },
    ],
    Expert: [
      {
        id: "py-exp-1",
        language: "python",
        difficulty: "Expert",
        title: "Dataclass with Validation",
        code: "from dataclasses import dataclass, field\n\n@dataclass(frozen=True)\nclass TelemetryData:\n    session_id: str\n    wpm: float\n    accuracy: float\n    symbols: dict[str, int] = field(default_factory=dict)\n\n    def is_valid(self) -> bool:\n        return self.accuracy >= 0.0 and self.wpm >= 0.0",
      },
    ],
  },
  java: {
    Beginner: [
      {
        id: "java-beg-1",
        language: "java",
        difficulty: "Beginner",
        title: "Loop & Accumulator",
        code: "int sum = 0;\nfor (int i = 1; i <= 10; i++) {\n    sum += i;\n}",
      },
      {
        id: "java-beg-2",
        language: "java",
        difficulty: "Beginner",
        title: "Simple Method",
        code: 'public String formatGreeting(String username) {\n    return "Welcome back, " + username + "!";\n}',
      },
    ],
    Intermediate: [
      {
        id: "java-int-1",
        language: "java",
        difficulty: "Intermediate",
        title: "WPM Math Calculator",
        code: "public class WpmCalculator {\n    public static int compute(int chars, int seconds) {\n        double minutes = seconds / 60.0;\n        return (int) Math.round((chars / 5.0) / minutes);\n    }\n}",
      },
      {
        id: "java-int-2",
        language: "java",
        difficulty: "Intermediate",
        title: "Stream Filter Operations",
        code: 'List<String> words = Arrays.asList("precision", "speed", "cadence");\nwords.stream()\n    .filter(w -> w.length() > 5)\n    .forEach(System.out::println);',
      },
    ],
    Advanced: [
      {
        id: "java-adv-1",
        language: "java",
        difficulty: "Advanced",
        title: "Session Map Collector",
        code: "public Map<String, Integer> processSessions(List<Session> sessions) {\n    return sessions.stream()\n        .filter(s -> s.getAccuracy() >= 95.0)\n        .collect(Collectors.toMap(Session::getId, Session::getWpm));\n}",
      },
    ],
    Expert: [
      {
        id: "java-exp-1",
        language: "java",
        difficulty: "Expert",
        title: "Thread-Safe Generic Metric Engine",
        code: "public class KeyflowEngine<T extends Number> {\n    private final ConcurrentHashMap<String, T> metrics = new ConcurrentHashMap<>();\n    public synchronized void record(String key, T metric) {\n        this.metrics.put(key, metric);\n    }\n}",
      },
    ],
  },
  html: {
    Beginner: [
      {
        id: "html-beg-1",
        language: "html",
        difficulty: "Beginner",
        title: "Simple Card Layout",
        code: '<div class="card">\n  <h2>Keyflow Studio</h2>\n  <p>Master touch typing precision.</p>\n</div>',
      },
      {
        id: "html-beg-2",
        language: "html",
        difficulty: "Beginner",
        title: "Action Button",
        code: '<button type="submit" class="btn-primary">Start Practice</button>',
      },
    ],
    Intermediate: [
      {
        id: "html-int-1",
        language: "html",
        difficulty: "Intermediate",
        title: "Form Controls",
        code: '<form class="flex items-center gap-3">\n  <label for="username">Username</label>\n  <input type="text" id="username" name="username" placeholder="Enter username" class="px-4 py-2 border rounded-xl" required />\n  <button type="submit" class="btn">Save</button>\n</form>',
      },
    ],
    Advanced: [
      {
        id: "html-adv-1",
        language: "html",
        difficulty: "Advanced",
        title: "Semantic Hero Container",
        code: '<main class="max-w-4xl mx-auto px-6 py-12">\n  <section id="hero" class="space-y-4">\n    <h1 class="text-3xl font-bold text-kfn-900">Developer Practice</h1>\n    <p class="text-sm text-kfn-500">Master programming symbols and syntax fluency.</p>\n  </section>\n</main>',
      },
    ],
    Expert: [
      {
        id: "html-exp-1",
        language: "html",
        difficulty: "Expert",
        title: "Data Table Structure",
        code: '<table class="w-full text-left border-collapse">\n  <thead>\n    <tr class="border-b text-xs font-semibold uppercase text-kfn-400">\n      <th class="py-2 px-4">Language</th>\n      <th class="py-2 px-4">WPM</th>\n      <th class="py-2 px-4">Symbol Acc</th>\n    </tr>\n  </thead>\n  <tbody class="divide-y divide-kfn-800 text-sm font-mono">\n    <tr>\n      <td class="py-3 px-4 font-bold text-kfa-400">JavaScript</td>\n      <td class="py-3 px-4">74 WPM</td>\n      <td class="py-3 px-4 text-kfa-400">96.8%</td>\n    </tr>\n  </tbody>\n</table>',
      },
    ],
  },
  css: {
    Beginner: [
      {
        id: "css-beg-1",
        language: "css",
        difficulty: "Beginner",
        title: "Button Styling",
        code: ".button {\n  background: #0F8F70;\n  color: #ffffff;\n  padding: 8px 16px;\n  border-radius: 8px;\n}",
      },
    ],
    Intermediate: [
      {
        id: "css-int-1",
        language: "css",
        difficulty: "Intermediate",
        title: "Card Surface Variables",
        code: ".keyflow-card {\n  background-color: var(--bg-surface);\n  border: 1px solid rgba(226, 232, 240, 0.8);\n  border-radius: 16px;\n  padding: 1.5rem;\n  transition: transform 0.2s ease;\n}",
      },
    ],
    Advanced: [
      {
        id: "css-adv-1",
        language: "css",
        difficulty: "Advanced",
        title: "Keyframe Animation",
        code: "@keyframes pulseGlow {\n  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }\n  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }\n  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }\n}",
      },
    ],
    Expert: [
      {
        id: "css-exp-1",
        language: "css",
        difficulty: "Expert",
        title: "Responsive Grid Breakpoint",
        code: "@media (min-width: 1024px) {\n  .dashboard-grid {\n    display: grid;\n    grid-template-columns: repeat(12, minmax(0, 1fr));\n    gap: 1.5rem;\n    align-items: start;\n  }\n}",
      },
    ],
  },
  sql: {
    Beginner: [
      {
        id: "sql-beg-1",
        language: "sql",
        difficulty: "Beginner",
        title: "Simple Select Query",
        code: "SELECT id, name, email FROM users WHERE is_active = true;",
      },
      {
        id: "sql-beg-2",
        language: "sql",
        difficulty: "Beginner",
        title: "Insert Record Statement",
        code: 'INSERT INTO sessions (user_id, wpm, accuracy) VALUES ("usr_101", 75, 98.2);',
      },
    ],
    Intermediate: [
      {
        id: "sql-int-1",
        language: "sql",
        difficulty: "Intermediate",
        title: "Group By Aggregate",
        code: "SELECT user_id, AVG(wpm) AS avg_wpm, MAX(accuracy) AS max_acc FROM typing_sessions GROUP BY user_id HAVING COUNT(*) >= 5 ORDER BY avg_wpm DESC;",
      },
    ],
    Advanced: [
      {
        id: "sql-adv-1",
        language: "sql",
        difficulty: "Advanced",
        title: "Inner Join Query",
        code: 'SELECT u.id, u.display_name, COUNT(s.id) AS session_count, AVG(s.wpm) AS avg_code_wpm FROM users u INNER JOIN sessions s ON u.id = s.user_id WHERE s.mode = "code" GROUP BY u.id, u.display_name HAVING AVG(s.wpm) > 60;',
      },
    ],
    Expert: [
      {
        id: "sql-exp-1",
        language: "sql",
        difficulty: "Expert",
        title: "Common Table Expression Rank",
        code: 'WITH user_ranks AS (\n  SELECT user_id, wpm, accuracy, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY wpm DESC) AS rank_num\n  FROM code_sessions WHERE language = "javascript"\n)\nSELECT user_id, wpm, accuracy FROM user_ranks WHERE rank_num = 1 ORDER BY wpm DESC LIMIT 10;',
      },
    ],
  },
};

/**
 * Get random snippet for selected language & difficulty
 */
export function getRandomCodeSnippet(
  lang: CodeLanguage,
  difficulty: CodeDifficulty = "Intermediate",
): string {
  const langKey = CODE_SNIPPETS_DATABASE[lang] ? lang : "javascript";
  const diffMap = CODE_SNIPPETS_DATABASE[langKey];
  const list =
    diffMap[difficulty] && diffMap[difficulty].length > 0
      ? diffMap[difficulty]
      : diffMap.Intermediate || diffMap.Beginner;

  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex].code;
}

// Programming Symbol Character Sets
export const CODING_SYMBOLS = new Set([
  "{",
  "}",
  "[",
  "]",
  "(",
  ")",
  "<",
  ">",
  ";",
  ":",
  ",",
  ".",
  "'",
  '"',
  "`",
  "=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "!",
  "?",
  "&",
  "|",
  "_",
  "\\",
  "#",
]);

export const BRACKET_SYMBOLS = new Set(["{", "}", "[", "]", "(", ")", "<", ">"]);

/**
 * Calculate actual code-specific accuracy metrics from actual typed telemetry
 */
export function calculateCodeMetrics(targetText: string, typedText: string) {
  let totalSymbols = 0;
  let correctSymbols = 0;

  let totalBrackets = 0;
  let correctBrackets = 0;

  let totalWhitespace = 0;
  let correctWhitespace = 0;

  const minLen = Math.min(targetText.length, typedText.length);

  for (let i = 0; i < targetText.length; i++) {
    const char = targetText[i];
    const typed = i < minLen ? typedText[i] : undefined;

    // Check symbols
    if (CODING_SYMBOLS.has(char)) {
      totalSymbols++;
      if (typed === char) correctSymbols++;
    }

    // Check brackets
    if (BRACKET_SYMBOLS.has(char)) {
      totalBrackets++;
      if (typed === char) correctBrackets++;
    }

    // Check whitespace
    if (/\s/.test(char)) {
      totalWhitespace++;
      if (typed === char) correctWhitespace++;
    }
  }

  const symbolAccuracy =
    totalSymbols > 0 ? Number(((correctSymbols / totalSymbols) * 100).toFixed(1)) : 100;
  const bracketAccuracy =
    totalBrackets > 0 ? Number(((correctBrackets / totalBrackets) * 100).toFixed(1)) : 100;
  const whitespaceAccuracy =
    totalWhitespace > 0 ? Number(((correctWhitespace / totalWhitespace) * 100).toFixed(1)) : 100;

  // Syntax accuracy combines symbols and brackets
  const totalSyntaxChars = totalSymbols + totalWhitespace;
  const correctSyntaxChars = correctSymbols + correctWhitespace;
  const syntaxAccuracy =
    totalSyntaxChars > 0 ? Number(((correctSyntaxChars / totalSyntaxChars) * 100).toFixed(1)) : 100;

  return {
    symbolAccuracy,
    bracketAccuracy,
    whitespaceAccuracy,
    syntaxAccuracy,
    totalSymbols,
    correctSymbols,
    totalBrackets,
    correctBrackets,
    totalWhitespace,
    correctWhitespace,
  };
}

/**
 * Identifies weak coding symbols from actual coding session history
 */
export function identifyWeakCodingSymbols(
  sessions: SessionResult[],
): { symbol: string; accuracy: number; totalAttempts: number }[] {
  const codeSessions = sessions.filter((s) => s.mode === "code" || s.sessionType === "code");
  if (codeSessions.length === 0) return [];

  const symbolStats: Record<string, { correct: number; total: number }> = {};

  codeSessions.forEach((s) => {
    const snippet = s.snippet || "";

    for (let i = 0; i < snippet.length; i++) {
      const char = snippet[i];
      if (CODING_SYMBOLS.has(char)) {
        if (!symbolStats[char]) {
          symbolStats[char] = { correct: 0, total: 0 };
        }
        symbolStats[char].total++;

        // Infer error based on session errorKeys
        const isErrorKey = s.errorKeys && s.errorKeys.includes(char);
        if (!isErrorKey) {
          symbolStats[char].correct++;
        }
      }
    }
  });

  const results: { symbol: string; accuracy: number; totalAttempts: number }[] = [];

  Object.entries(symbolStats).forEach(([sym, stats]) => {
    if (stats.total >= 2) {
      const acc = Number(((stats.correct / stats.total) * 100).toFixed(1));
      if (acc < 92) {
        results.push({ symbol: sym, accuracy: acc, totalAttempts: stats.total });
      }
    }
  });

  return results.sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Generates rule-based feedback for a finished code session
 */
export function getCodeSessionFeedback(session: Partial<SessionResult>): {
  strongestSyntax: string;
  needsPractice: string;
  recommendedFocus: string;
} {
  const symAcc = session.symbolAccuracy ?? session.accuracy ?? 95;
  const brkAcc = session.bracketAccuracy ?? session.accuracy ?? 95;
  const wsAcc = session.whitespaceAccuracy ?? session.accuracy ?? 95;

  let strongest = "General Syntax";
  let needsPractice = "None";

  if (brkAcc >= symAcc && brkAcc >= wsAcc) {
    strongest = "Parentheses & Brackets";
  } else if (symAcc >= brkAcc && symAcc >= wsAcc) {
    strongest = "Operators & Punctuation";
  } else {
    strongest = "Indentation & Whitespace";
  }

  if (symAcc < 90) {
    needsPractice = "Operators & Semicolons";
  } else if (brkAcc < 90) {
    needsPractice = "Curly & Square Brackets";
  } else if (wsAcc < 90) {
    needsPractice = "Indentation Cadence";
  } else {
    needsPractice = "Speed & Velocity";
  }

  return { strongestSyntax: strongest, needsPractice, recommendedFocus: needsPractice };
}
