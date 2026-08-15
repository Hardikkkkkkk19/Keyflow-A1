import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getFingerForKey } from "../../utils/typingUtils";
import { KeyPerformance, KeyboardLayout } from "../../types";
import { Keyboard, Zap, Sparkles, Cpu, Palette } from "lucide-react";

export type KeyboardStyle = "classic" | "cyber" | "aurora" | "mechanical";

interface VirtualKeyboardProps {
  activeKey?: string; // Currently pressed key or target key
  pressedKey?: string; // Key being pressed right now
  showFingerGuide?: boolean;
  layout?: KeyboardLayout;
  heatmapData?: KeyPerformance[];
  isHeatmapMode?: boolean;
  heatmapMetric?: "accuracy" | "errors" | "usage" | "latency";
  onKeyClick?: (key: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  style?: KeyboardStyle;
  onStyleChange?: (style: KeyboardStyle) => void;
  showStyleSelector?: boolean;
}

interface KeyConfig {
  code: string;
  label: string;
  subLabel?: string;
  width?: string;
  isHomeRow?: boolean;
}

const STYLE_OPTIONS: {
  id: KeyboardStyle;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "classic",
    label: "Classic",
    shortLabel: "Classic",
    description: "Clean standard Keyflow aesthetic",
    icon: Keyboard,
  },
  {
    id: "cyber",
    label: "Cyber Neon",
    shortLabel: "Cyber",
    description: "Futuristic mechanical design with cyan/emerald glow",
    icon: Zap,
  },
  {
    id: "aurora",
    label: "Aurora Glass",
    shortLabel: "Aurora",
    description: "Translucent glassmorphism with soft emerald gradients",
    icon: Sparkles,
  },
  {
    id: "mechanical",
    label: "Pro Mechanical",
    shortLabel: "Pro Mech",
    description: "High-end matte keycaps with tactile depth and shadows",
    icon: Cpu,
  },
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeKey,
  pressedKey,
  showFingerGuide = false,
  layout = "qwerty",
  heatmapData,
  isHeatmapMode = false,
  heatmapMetric = "accuracy",
  onKeyClick,
  className = "",
  size = "md",
  style: styleProp,
  onStyleChange,
  showStyleSelector = true,
}) => {
  const [hoveredKey, setHoveredKey] = useState<KeyPerformance | null>(null);

  // Persistent Keyboard Style state via localStorage
  const [currentStyle, setCurrentStyle] = useState<KeyboardStyle>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("keyflow_keyboard_style") as KeyboardStyle;
      if (saved && ["classic", "cyber", "aurora", "mechanical"].includes(saved)) {
        return saved;
      }
    }
    return styleProp || "classic";
  });

  useEffect(() => {
    if (styleProp) {
      setCurrentStyle(styleProp);
    }
  }, [styleProp]);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("keyflow_keyboard_style") as KeyboardStyle;
      if (saved && ["classic", "cyber", "aurora", "mechanical"].includes(saved)) {
        setCurrentStyle(saved);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("keyflow-style-change", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("keyflow-style-change", handleStorageChange);
    };
  }, []);

  const handleStyleChange = (newStyle: KeyboardStyle) => {
    setCurrentStyle(newStyle);
    if (typeof window !== "undefined") {
      localStorage.setItem("keyflow_keyboard_style", newStyle);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("keyflow-style-change"));
    }
    if (onStyleChange) {
      onStyleChange(newStyle);
    }
  };

  const keyboardRows: KeyConfig[][] = [
    // Row 1: Number Row
    [
      { code: "`", label: "`", subLabel: "~" },
      { code: "1", label: "1", subLabel: "!" },
      { code: "2", label: "2", subLabel: "@" },
      { code: "3", label: "3", subLabel: "#" },
      { code: "4", label: "4", subLabel: "$" },
      { code: "5", label: "5", subLabel: "%" },
      { code: "6", label: "6", subLabel: "^" },
      { code: "7", label: "7", subLabel: "&" },
      { code: "8", label: "8", subLabel: "*" },
      { code: "9", label: "9", subLabel: "(" },
      { code: "0", label: "0", subLabel: ")" },
      { code: "-", label: "-", subLabel: "_" },
      { code: "=", label: "=", subLabel: "+" },
      { code: "backspace", label: "⌫", width: "w-16 sm:w-20 grow" },
    ],
    // Row 2: Top Row
    [
      { code: "tab", label: "Tab", width: "w-14 sm:w-16" },
      { code: "q", label: "Q" },
      { code: "w", label: "W" },
      { code: "e", label: "E" },
      { code: "r", label: "R" },
      { code: "t", label: "T" },
      { code: "y", label: "Y" },
      { code: "u", label: "U" },
      { code: "i", label: "I" },
      { code: "o", label: "O" },
      { code: "p", label: "P" },
      { code: "[", label: "[", subLabel: "{" },
      { code: "]", label: "]", subLabel: "}" },
      { code: "\\", label: "\\", subLabel: "|", width: "w-12 sm:w-14 grow" },
    ],
    // Row 3: Home Row (F and J have tactile bumps)
    [
      { code: "capslock", label: "Caps", width: "w-16 sm:w-20" },
      { code: "a", label: "A" },
      { code: "s", label: "S" },
      { code: "d", label: "D" },
      { code: "f", label: "F", isHomeRow: true },
      { code: "g", label: "G" },
      { code: "h", label: "H" },
      { code: "j", label: "J", isHomeRow: true },
      { code: "k", label: "K" },
      { code: "l", label: "L" },
      { code: ";", label: ";", subLabel: ":" },
      { code: "'", label: "'", subLabel: '"' },
      { code: "enter", label: "Enter ↵", width: "w-20 sm:w-24 grow" },
    ],
    // Row 4: Bottom Row
    [
      { code: "shift", label: "Shift ⇧", width: "w-20 sm:w-24" },
      { code: "z", label: "Z" },
      { code: "x", label: "X" },
      { code: "c", label: "C" },
      { code: "v", label: "V" },
      { code: "b", label: "B" },
      { code: "n", label: "N" },
      { code: "m", label: "M" },
      { code: ",", label: ",", subLabel: "<" },
      { code: ".", label: ".", subLabel: ">" },
      { code: "/", label: "/", subLabel: "?" },
      { code: "shift_right", label: "Shift ⇧", width: "w-20 sm:w-24 grow" },
    ],
    // Row 5: Spacebar Row
    [
      { code: "ctrl", label: "Ctrl", width: "w-12 sm:w-14" },
      { code: "alt", label: "Alt", width: "w-12 sm:w-14" },
      { code: " ", label: "Space", width: "w-56 sm:w-80 grow" },
      { code: "alt_right", label: "Alt", width: "w-12 sm:w-14" },
      { code: "ctrl_right", label: "Ctrl", width: "w-12 sm:w-14" },
    ],
  ];

  const getKeyHeatColor = (keyChar: string) => {
    if (!isHeatmapMode || !heatmapData) return null;
    const match = heatmapData.find((d) => d.key.toLowerCase() === keyChar.toLowerCase());
    if (!match) return null;

    if (heatmapMetric === "accuracy") {
      if (match.accuracy < 90)
        return "bg-rose-500/90 text-white border-rose-600 shadow-rose-500/30";
      if (match.accuracy < 95)
        return "bg-amber-400/90 text-amber-950 border-amber-500 shadow-amber-500/20";
      return "bg-kfa-500/90 text-white border-kfa-600 shadow-kfa-500/30";
    } else if (heatmapMetric === "errors") {
      if (match.errors > 10) return "bg-rose-500/90 text-white border-rose-600 shadow-rose-500/30";
      if (match.errors > 3)
        return "bg-amber-400/90 text-amber-950 border-amber-500 shadow-amber-500/20";
      return "bg-kfa-500/90 text-white border-kfa-600 shadow-kfa-500/30";
    } else if (heatmapMetric === "usage") {
      if (match.presses > 100) return "bg-kfa-600/90 text-white border-kfa-500 shadow-kfa-500/30";
      if (match.presses > 40) return "bg-kfa-500/70 text-kfa-100 border-kfa-400";
      return "bg-kfn-700/80 text-kfn-300 border-kfn-600";
    } else if (heatmapMetric === "latency") {
      if (match.avgLatencyMs > 180)
        return "bg-rose-500/90 text-white border-rose-600 shadow-rose-500/30";
      if (match.avgLatencyMs > 140)
        return "bg-amber-400/90 text-amber-950 border-amber-500 shadow-amber-500/20";
      return "bg-kfa-500/90 text-white border-kfa-600 shadow-kfa-500/30";
    }

    if (match.heatLevel === "hot") {
      return "bg-rose-500/90 text-white border-rose-600 shadow-rose-500/30";
    } else if (match.heatLevel === "warm") {
      return "bg-amber-400/90 text-amber-950 border-amber-500 shadow-amber-500/20";
    } else if (match.heatLevel === "cool") {
      return "bg-kfa-500/90 text-white border-kfa-600 shadow-kfa-500/30";
    }
    return "bg-kfa-500/80 text-white border-kfa-600";
  };

  const SHIFT_SYMBOL_MAP: Record<string, string> = {
    "!": "1",
    "@": "2",
    "#": "3",
    $: "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
    _: "-",
    "+": "=",
    "{": "[",
    "}": "]",
    "|": "\\",
    ":": ";",
    '"': "'",
    "<": ",",
    ">": ".",
    "?": "/",
    "~": "`",
  };

  const isMatchingKey = (code: string, targetChar?: string) => {
    if (!targetChar) return false;
    const normTarget = targetChar.toLowerCase();
    const normCode = code.toLowerCase();

    if (normTarget === " " && normCode === " ") return true;
    if (normTarget === normCode) return true;
    if (normTarget === "\n" && normCode === "enter") return true;

    // Check if target is a shifted character
    const baseCode = SHIFT_SYMBOL_MAP[targetChar];
    if (baseCode) {
      if (normCode === baseCode) return true;
      if (normCode === "shift" || normCode === "shift_right") return true;
    }

    return false;
  };

  const keySizeClasses = {
    sm: "h-8 text-[11px]",
    md: "h-10 sm:h-12 text-xs sm:text-sm",
    lg: "h-12 sm:h-14 text-sm sm:text-base",
  };

  const containerStyles: Record<KeyboardStyle, string> = {
    classic: "bg-[#0D1210] rounded-2xl border border-[#F3F5F2]/10 shadow-xl",
    cyber:
      "bg-[#040806] rounded-2xl border-2 border-[#18C69A]/50 shadow-[0_0_40px_rgba(24,198,154,0.25)] relative overflow-hidden",
    aurora:
      "bg-[#06120E]/50 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] relative overflow-hidden bg-gradient-to-br from-[#18C69A]/15 via-transparent to-[#0F8F70]/20",
    mechanical:
      "bg-[#070A09] rounded-2xl border-2 border-[#1E2E28] shadow-[0_24px_50px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] p-4 sm:p-6 relative",
  };

  const getKeyStyle = (
    key: KeyConfig,
    isActive: boolean,
    isPressed: boolean,
    heatColor: string | null,
    showFingerGuide: boolean,
    fingerInfo: any,
    style: KeyboardStyle,
  ) => {
    if (heatColor) return heatColor;

    if (style === "cyber") {
      if (isPressed) {
        return "bg-[#38D6AE] text-[#020B08] border-[#A6FCDB] font-black scale-[0.95] translate-y-0.5 shadow-[0_0_30px_rgba(56,214,174,1)]";
      }
      if (isActive) {
        return "bg-[#0B251D] text-[#A6FCDB] border-[#38D6AE] shadow-[0_0_20px_rgba(56,214,174,0.8),inset_0_0_10px_rgba(56,214,174,0.4)] font-extrabold animate-pulse";
      }
      let base =
        "bg-[#050B09] hover:bg-[#0E1A16] text-[#38D6AE] border-[#18C69A]/40 hover:border-[#38D6AE] shadow-[0_0_8px_rgba(24,198,154,0.15)] font-mono";
      if (showFingerGuide && fingerInfo) {
        base += " border-l-2 border-l-[#38D6AE]";
      }
      return base;
    }

    if (style === "aurora") {
      if (isPressed) {
        return "bg-[#18C69A]/85 backdrop-blur-2xl text-[#02100A] border-white font-black scale-[0.95] translate-y-0.5 shadow-[0_0_35px_rgba(24,198,154,0.9),inset_0_2px_4px_rgba(255,255,255,0.95)]";
      }
      if (isActive) {
        return "bg-[#18C69A]/30 backdrop-blur-2xl text-[#A6FCDB] border-emerald-300 shadow-[0_0_25px_rgba(24,198,154,0.6),inset_0_1px_2px_rgba(255,255,255,0.8)] font-extrabold";
      }
      let base =
        "bg-white/[0.08] hover:bg-white/[0.15] backdrop-blur-xl text-white border border-white/25 hover:border-white/50 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.35)]";
      if (showFingerGuide && fingerInfo) {
        base += " border-l-2 border-l-[#38D6AE]";
      }
      return base;
    }

    if (style === "mechanical") {
      if (isPressed) {
        return "bg-gradient-to-b from-[#18C69A] to-[#0F8F70] text-[#030A08] border-t border-t-white/90 border-b-0 font-black translate-y-[4px] shadow-[0_1px_0_0_#030A08,inset_0_2px_6px_rgba(0,0,0,0.7)]";
      }
      if (isActive) {
        return "bg-gradient-to-b from-[#1B352B] to-[#0E1D17] text-[#38D6AE] border-t border-t-[#38D6AE]/70 border-x border-x-[#18C69A]/40 border-b-4 border-b-[#050C0A] shadow-[0_5px_0_0_#050C0A,0_0_20px_rgba(24,198,154,0.5)] font-extrabold";
      }
      let base =
        "bg-gradient-to-b from-[#212E28] to-[#121A17] hover:from-[#283931] hover:to-[#17221E] text-[#F3F5F2] border-t border-t-white/25 border-x border-x-white/10 border-b-4 border-b-[#060908] shadow-[0_5px_0_0_#050806,0_8px_16px_rgba(0,0,0,0.75)] font-bold transition-all duration-75";
      if (showFingerGuide && fingerInfo) {
        base += " border-l-2 border-l-[#18C69A]";
      }
      return base;
    }

    // Default: Classic
    if (isPressed) {
      return "bg-[#18C69A] text-[#050807] border-[#18C69A] font-bold scale-[0.98] translate-y-0.5 shadow-inner";
    }
    if (isActive) {
      return "bg-[#151B18] text-[#18C69A] border-[#18C69A]/60 shadow-xs font-bold";
    }
    let base = "bg-[#111715] hover:bg-[#151B18] text-[#F3F5F2] border-[#F3F5F2]/10 shadow-xs";
    if (showFingerGuide && fingerInfo) {
      base += " border-l-2 border-l-[#18C69A]/40";
    }
    return base;
  };

  return (
    <div
      className={`p-3 sm:p-5 select-none overflow-x-auto transition-all duration-300 ${containerStyles[currentStyle]} ${className}`}
    >
      {/* Keyboard Style Selector Header Bar */}
      {showStyleSelector && (
        <div className="flex flex-wrap items-center justify-between mb-3.5 pb-2.5 border-b border-[#F3F5F2]/10 gap-2">
          <div className="flex items-center gap-2 text-xs text-[#A6ADA8]">
            <Palette className="w-3.5 h-3.5 text-[#18C69A]" />
            <span className="font-mono text-[11px] font-medium hidden sm:inline">
              Keyboard Style
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#050807]/80 p-1 rounded-xl border border-[#F3F5F2]/10 overflow-x-auto">
            {STYLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = currentStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleStyleChange(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? "bg-[#18C69A] text-[#050807] font-bold shadow-xs"
                      : "text-[#A6ADA8] hover:text-[#F3F5F2] hover:bg-white/5"
                  }`}
                  title={opt.description}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">{opt.label}</span>
                  <span className="sm:hidden">{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Background Decorators per Style */}
      {currentStyle === "cyber" && (
        <>
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#38D6AE] to-transparent shadow-[0_0_12px_#38D6AE]" />
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#18C69A] to-transparent" />
        </>
      )}
      {currentStyle === "aurora" && (
        <>
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[#18C69A]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#0F8F70]/25 blur-3xl pointer-events-none" />
        </>
      )}
      {currentStyle === "mechanical" && (
        <div className="absolute top-2 right-4 flex items-center gap-1.5 opacity-40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#18C69A]" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#18C69A]">
            MX-SWITCH PLATE
          </span>
        </div>
      )}
      {isHeatmapMode && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-[#050807] border border-[#F3F5F2]/10 text-xs font-mono text-[#A6ADA8] flex items-center justify-between min-h-[32px]">
          {hoveredKey ? (
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="font-bold text-[#050807] text-sm bg-[#18C69A] px-2 py-0.5 rounded">
                Key '{hoveredKey.displayLabel}'
              </span>
              <span>
                Acc: <strong className="text-[#18C69A]">{hoveredKey.accuracy}%</strong>
              </span>
              <span>
                Errors: <strong className="text-rose-400">{hoveredKey.errors}</strong>
              </span>
              <span>
                Usage: <strong className="text-[#F3F5F2]">{hoveredKey.presses}</strong>
              </span>
              <span>
                Avg Latency: <strong className="text-amber-300">{hoveredKey.avgLatencyMs}ms</strong>
              </span>
            </div>
          ) : (
            <span className="text-[#68716C] text-[11px]">
              Hover over any key for performance analysis • Click key to isolate drill
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5 sm:gap-2 min-w-[620px] max-w-4xl mx-auto">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5 sm:gap-2 justify-center">
            {row.map((key) => {
              const isActive = isMatchingKey(key.code, activeKey);
              const isPressed = isMatchingKey(key.code, pressedKey);
              const fingerInfo = showFingerGuide ? getFingerForKey(key.code) : null;
              const heatColor = getKeyHeatColor(key.code);

              const keyStyle = getKeyStyle(
                key,
                isActive,
                isPressed,
                heatColor,
                showFingerGuide,
                fingerInfo,
                currentStyle,
              );

              const keyRadiusClass =
                currentStyle === "aurora"
                  ? "rounded-xl"
                  : currentStyle === "cyber" || currentStyle === "mechanical"
                    ? "rounded-md"
                    : "rounded-lg";

              return (
                <motion.button
                  key={key.code}
                  type="button"
                  onClick={() => onKeyClick && onKeyClick(key.code)}
                  onMouseEnter={() => {
                    if (isHeatmapMode && heatmapData) {
                      const match = heatmapData.find(
                        (h) => h.key.toLowerCase() === key.code.toLowerCase(),
                      );
                      if (match) setHoveredKey(match);
                    }
                  }}
                  onMouseLeave={() => setHoveredKey(null)}
                  whileTap={{ scale: 0.96, y: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`relative flex flex-col items-center justify-center font-medium border transition-all duration-150 cursor-pointer ${keyRadiusClass} ${
                    key.width || "w-9 sm:w-12"
                  } ${keySizeClasses[size]} ${keyStyle}`}
                >
                  {/* Cyber Neon top edge LED strip */}
                  {currentStyle === "cyber" && !heatColor && (
                    <span className="absolute top-0 inset-x-1 h-[2px] bg-[#38D6AE]/80 rounded-full shadow-[0_0_6px_#38D6AE]" />
                  )}

                  {/* Aurora Glass top glare highlight */}
                  {currentStyle === "aurora" && !heatColor && (
                    <span className="absolute top-0.5 inset-x-1 h-2 rounded-t-lg bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
                  )}

                  {/* Sublabel for numbers/symbols */}
                  {key.subLabel && (
                    <span className="text-[9px] sm:text-[10px] text-kfn-400 dark:text-kfn-500 font-mono leading-none z-10">
                      {key.subLabel}
                    </span>
                  )}

                  {/* Main label */}
                  <span
                    className={`font-mono font-semibold leading-tight z-10 ${
                      isActive || isPressed ? "font-bold" : ""
                    }`}
                  >
                    {key.label}
                  </span>

                  {/* Tactile bump marker for F & J */}
                  {key.isHomeRow && (
                    <span className="absolute bottom-1 w-2.5 h-0.5 bg-[#18C69A]/70 rounded-full z-10" />
                  )}

                  {/* Finger guide indicator bar */}
                  {showFingerGuide && fingerInfo && !isHeatmapMode && (
                    <span
                      className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full z-10 ${fingerInfo.color}`}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Keyboard Footer Info */}
      <div className="mt-4 pt-3 border-t border-kfn-200/20 dark:border-kfn-800/80 flex items-center justify-between text-[11px] text-kfn-500 dark:text-kfn-400 px-2">
        <div className="flex items-center gap-4">
          {showFingerGuide && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-kfa-500" />
              <span>Left Hand</span>
              <span className="w-2 h-2 rounded-full bg-kfa-500 ml-2" />
              <span>Right Hand</span>
            </div>
          )}
          {isHeatmapMode && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-kfa-500" /> High Performance
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Medium Performance
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Needs Practice
              </span>
            </div>
          )}
        </div>
        <div className="text-kfn-400 font-mono hidden sm:block">
          ANSI 60% ({layout.toUpperCase()}) • Physical Keyboard Synced
        </div>
      </div>
    </div>
  );
};
