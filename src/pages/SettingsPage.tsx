import React from "react";
import { PageTransition } from "../components/common/PageTransition";
import { ScrollReveal } from "../components/common/ScrollReveal";
import { audioEngine } from "../utils/audio";
import {
  Settings,
  KeyboardLayout,
  KeyboardStyle,
  SoundPreset,
  CaretStyle,
  ThemeMode,
  RoutePath,
} from "../types";
import {
  Settings as SettingsIcon,
  Volume2,
  Keyboard,
  Palette,
  Eye,
  Sparkles,
  Sun,
  Moon,
  Play,
  Shield,
  Trophy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { setLeaderboardVisibility } from "../utils/leaderboardUtils";

interface SettingsPageProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  onNavigate: (path: RoutePath) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings }) => {
  const [currentStyle, setCurrentStyle] = React.useState<KeyboardStyle>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("keyflow_keyboard_style") as KeyboardStyle;
      if (saved && ["classic", "cyber", "aurora", "mechanical"].includes(saved)) {
        return saved;
      }
    }
    return "classic";
  });

  React.useEffect(() => {
    const handleStyleUpdate = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("keyflow_keyboard_style") as KeyboardStyle;
        if (saved && ["classic", "cyber", "aurora", "mechanical"].includes(saved)) {
          setCurrentStyle(saved);
        }
      }
    };

    window.addEventListener("storage", handleStyleUpdate);
    window.addEventListener("keyflow-style-change", handleStyleUpdate);
    return () => {
      window.removeEventListener("storage", handleStyleUpdate);
      window.removeEventListener("keyflow-style-change", handleStyleUpdate);
    };
  }, []);

  const handleStyleSelect = (styleId: KeyboardStyle) => {
    setCurrentStyle(styleId);
    if (typeof window !== "undefined") {
      localStorage.setItem("keyflow_keyboard_style", styleId);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("keyflow-style-change"));
    }
  };

  const handleTestSound = (preset: SoundPreset) => {
    audioEngine.playKeySound(preset, "normal");
  };

  return (
    <PageTransition>
      <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <ScrollReveal className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-kfa-50 dark:bg-kfa-950/80 border border-kfa-200/60 dark:border-kfa-800 text-xs font-semibold text-kfa-700 dark:text-kfa-300">
            <SettingsIcon className="w-3.5 h-3.5 text-kfa-500" />
            <span>Preferences & Customization</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-kfn-900 dark:text-white tracking-tight">
            Keyboard & Audio Settings
          </h1>
          <p className="text-base text-kfn-600 dark:text-kfn-400">
            Personalize mechanical sound profiles, virtual keyboard finger guides, caret styles, and
            themes.
          </p>
        </ScrollReveal>

        <div className="space-y-6">
          {/* Sound Presets */}
          <div className="bg-white dark:bg-kfn-900 p-6 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-kfa-500" />
                  Sound Feedback
                </h2>
                <p className="text-xs text-kfn-500">
                  Select keypress audio preset or adjust typing volume.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["mechanical", "tactile", "creamy", "silent"] as SoundPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    onUpdateSettings({ sound: preset });
                    handleTestSound(preset);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer capitalize ${
                    settings.sound === preset
                      ? "bg-kfa-50 dark:bg-kfa-950/80 border-kfa-500 text-kfa-900 dark:text-kfa-200 font-bold shadow-sm"
                      : "bg-kfn-50 dark:bg-kfn-800/50 border-kfn-200 dark:border-kfn-700 text-kfn-700 dark:text-kfn-300"
                  }`}
                >
                  <div className="text-sm font-bold">{preset}</div>
                  <span className="text-[10px] text-kfn-400 block mt-1">Click to test</span>
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div className="pt-3 flex items-center gap-4">
              <span className="text-xs font-semibold text-kfn-600 dark:text-kfn-300 min-w-16">
                Volume:
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume}
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  onUpdateSettings({ soundVolume: vol });
                  audioEngine.setVolume(vol);
                  audioEngine.playKeySound(settings.sound, "normal");
                }}
                className="w-full accent-kfa-600 cursor-pointer"
              />
              <span className="text-xs font-mono text-kfn-500 min-w-10">
                {settings.soundVolume}%
              </span>
            </div>
          </div>

          {/* Keyboard Layout & Virtual Helpers */}
          <div className="bg-white dark:bg-kfn-900 p-6 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-kfa-500" />
                Virtual Keyboard & Layout
              </h2>
              <p className="text-xs text-kfn-500">
                Configure layout mappings and finger zone guides.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["qwerty", "dvorak", "colemak"] as KeyboardLayout[]).map((layout) => (
                <button
                  key={layout}
                  onClick={() => onUpdateSettings({ layout })}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer uppercase text-xs font-bold ${
                    settings.layout === layout
                      ? "bg-kfa-50 dark:bg-kfa-950/80 border-kfa-500 text-kfa-950 dark:text-kfa-200"
                      : "bg-kfn-50 dark:bg-kfn-800/50 border-kfn-200 dark:border-kfn-700 text-kfn-700 dark:text-kfn-300"
                  }`}
                >
                  {layout} Layout
                </button>
              ))}
            </div>

            {/* Keyboard Visual Style */}
            <div className="pt-3 border-t border-kfn-200/60 dark:border-kfn-800/80 space-y-2">
              <label className="text-xs font-bold text-kfn-800 dark:text-kfn-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-kfa-500" />
                Keyboard Visual Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "classic", label: "Classic", desc: "Default Keyflow aesthetic" },
                  { id: "cyber", label: "Cyber Neon", desc: "Illuminated cyan/emerald" },
                  { id: "aurora", label: "Aurora Glass", desc: "Glassmorphism & gradients" },
                  { id: "mechanical", label: "Pro Mechanical", desc: "Tactile keycap depth" },
                ].map((s) => {
                  const isSelected = currentStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStyleSelect(s.id as KeyboardStyle)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-kfa-50 dark:bg-kfa-950/80 border-kfa-500 text-kfa-950 dark:text-kfa-200 font-bold shadow-sm"
                          : "bg-kfn-50 dark:bg-kfn-800/50 border-kfn-200 dark:border-kfn-700 text-kfn-700 dark:text-kfn-300 hover:border-kfa-400"
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-kfn-400 mt-0.5">{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-kfn-700 dark:text-kfn-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showVirtualKeyboard}
                  onChange={(e) => onUpdateSettings({ showVirtualKeyboard: e.target.checked })}
                  className="rounded text-kfa-600 focus:ring-kfa-500"
                />
                Show Virtual Keyboard Below Practice Area
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-kfn-700 dark:text-kfn-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showFingerGuide}
                  onChange={(e) => onUpdateSettings({ showFingerGuide: e.target.checked })}
                  className="rounded text-kfa-600 focus:ring-kfa-500"
                />
                Show Finger Zone Placement Indicators
              </label>
            </div>
          </div>

          {/* Caret & Visual Theme */}
          <div className="bg-white dark:bg-kfn-900 p-6 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-kfa-500" />
                Caret Style & Appearance
              </h2>
              <p className="text-xs text-kfn-500">Customize the active typing caret cursor.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["line", "block", "underline", "glowing"] as CaretStyle[]).map((caret) => (
                <button
                  key={caret}
                  onClick={() => onUpdateSettings({ caretStyle: caret })}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer capitalize text-xs font-bold ${
                    settings.caretStyle === caret
                      ? "bg-kfa-50 dark:bg-kfa-950/80 border-kfa-500 text-kfa-950 dark:text-kfa-200"
                      : "bg-kfn-50 dark:bg-kfn-800/50 border-kfn-200 dark:border-kfn-700 text-kfn-700 dark:text-kfn-300"
                  }`}
                >
                  {caret} Caret
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Competitive Leaderboard Settings */}
          <div className="bg-white dark:bg-kfn-900 p-6 rounded-3xl border border-kfn-200/80 dark:border-kfn-800 shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-lg text-kfn-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Privacy & Competitive Leaderboard
              </h2>
              <p className="text-xs text-kfn-500">
                Control your public profile visibility on competitive player rankings.
              </p>
            </div>

            <div className="p-4 bg-kfn-50 dark:bg-kfn-800/40 rounded-2xl border border-kfn-200 dark:border-kfn-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-kfn-900 dark:text-white block">
                  Show me on public leaderboards
                </span>
                <p className="text-xs text-kfn-500 max-w-lg">
                  When enabled, your display name, level, and verified WPM scores will be visible to
                  other players on the public leaderboard. Your email and private session logs
                  remain completely confidential.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.showOnLeaderboard !== false}
                  onChange={(e) => {
                    const isVisible = e.target.checked;
                    onUpdateSettings({ showOnLeaderboard: isVisible });
                    const userId = localStorage.getItem("keyflow_current_user_id") || "local_user";
                    setLeaderboardVisibility(userId, isVisible);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-kfn-200 peer-focus:outline-none rounded-full peer dark:bg-kfn-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-kfn-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-kfn-600 peer-checked:bg-kfa-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
