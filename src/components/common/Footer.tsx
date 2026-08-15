import React from "react";
import { RoutePath } from "../../types";
import { Keyboard, Shield, Zap, Sparkles, Heart } from "lucide-react";

interface FooterProps {
  onNavigate: (path: RoutePath) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-kfn-900 text-kfn-300 dark:bg-kfn-950 border-t border-kfn-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-kfn-800">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-kfa-500 to-kfa-500 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-kfn-900 rounded-[6px] flex items-center justify-center">
                  <Keyboard className="w-4 h-4 text-kfa-400" />
                </div>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                KEY<span className="text-kfa-400">FLOW</span>
              </span>
            </div>
            <p className="text-kfn-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              The modern typing performance platform. Master speed, accuracy, and flow through
              personalized drills and intelligent analytics.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-kfn-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kfn-800 border border-kfn-700">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> WPM Engine v2.4
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-kfn-800 border border-kfn-700">
                <Sparkles className="w-3.5 h-3.5 text-kfa-400" /> AI Coach Ready
              </span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-kfn-100 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs text-kfn-400">
              <li>
                <button
                  onClick={() => onNavigate("/practice")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Typing Practice
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/drills")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Smart Drills
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/analytics")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Performance Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/challenges")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Daily Challenges
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/coach")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  AI Coach
                </button>
              </li>
            </ul>
          </div>

          {/* Shortcuts Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-kfn-100 uppercase tracking-wider">
              Quick Shortcuts
            </h4>
            <ul className="space-y-2 text-xs text-kfn-400">
              <li className="flex items-center justify-between">
                <span>Restart Test</span>
                <kbd className="px-1.5 py-0.5 bg-kfn-800 text-kfn-300 border border-kfn-700 rounded text-[10px] font-mono">
                  Tab
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Toggle Pause</span>
                <kbd className="px-1.5 py-0.5 bg-kfn-800 text-kfn-300 border border-kfn-700 rounded text-[10px] font-mono">
                  Esc
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Next Mode</span>
                <kbd className="px-1.5 py-0.5 bg-kfn-800 text-kfn-300 border border-kfn-700 rounded text-[10px] font-mono">
                  Alt + N
                </kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Quick Settings</span>
                <kbd className="px-1.5 py-0.5 bg-kfn-800 text-kfn-300 border border-kfn-700 rounded text-[10px] font-mono">
                  Alt + S
                </kbd>
              </li>
            </ul>
          </div>

          {/* Account / Preferences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-kfn-100 uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-xs text-kfn-400">
              <li>
                <button
                  onClick={() => onNavigate("/profile")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Profile & Badges
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/settings")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Keyboard & Sound Config
                </button>
              </li>
              <li className="pt-2 text-kfn-400 text-[11px] leading-relaxed">
                Designed for speed, precision, and lifelong typing flow.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-kfn-400 gap-4">
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for developers,
            writers, and typists worldwide.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-kfa-400" /> Client-Side Engine
            </span>
            <span>© {new Date().getFullYear()} KEYFLOW Inc. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
