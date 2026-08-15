import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { RoutePath, Settings, SessionResult } from "./types";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { WelcomeTransition } from "./components/auth/WelcomeTransition";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { OfflineBanner } from "./components/common/OfflineBanner";
import { StagedLoadingScreen } from "./components/common/StagedLoadingScreen";

import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { PracticePage } from "./pages/PracticePage";
import { DrillsPage } from "./pages/DrillsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

// Lazy loaded secondary views
const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })),
);
const ChallengesPage = lazy(() =>
  import("./pages/ChallengesPage").then((m) => ({ default: m.ChallengesPage })),
);
const CoachPage = lazy(() => import("./pages/CoachPage").then((m) => ({ default: m.CoachPage })));
const LeaderboardPage = lazy(() =>
  import("./pages/LeaderboardPage").then((m) => ({ default: m.LeaderboardPage })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

import { Sparkles } from "lucide-react";

const PROTECTED_ROUTES: RoutePath[] = [
  "/dashboard",
  "/practice",
  "/drills",
  "/analytics",
  "/challenges",
  "/coach",
  "/leaderboard",
  "/profile",
  "/settings",
];

// Session flag so staged loading screen runs only once on initial app startup
let hasAppLoadedOnce = false;

function AppContent() {
  const { user, userStatsProfile, loading, welcomeUser, clearWelcome, recordSession } = useAuth();
  const [loadingComplete, setLoadingComplete] = useState(() => hasAppLoadedOnce);

  // Pre-fetch lazy modules once initial load finishes for instant route navigation
  useEffect(() => {
    if (loadingComplete) {
      import("./pages/AnalyticsPage");
      import("./pages/ChallengesPage");
      import("./pages/CoachPage");
      import("./pages/LeaderboardPage");
      import("./pages/ProfilePage");
      import("./pages/SettingsPage");
    }
  }, [loadingComplete]);

  // Router path state
  const [currentPath, setCurrentPath] = useState<RoutePath>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname as RoutePath;
      const validPaths: RoutePath[] = [
        "/",
        "/dashboard",
        "/practice",
        "/drills",
        "/analytics",
        "/challenges",
        "/coach",
        "/ai-coach",
        "/leaderboard",
        "/profile",
        "/settings",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ];
      return validPaths.includes(path) ? path : "/";
    }
    return "/";
  });

  const [redirectTarget, setRedirectTarget] = useState<RoutePath | undefined>(undefined);
  const [drillOverrideText, setDrillOverrideText] = useState<string | undefined>(undefined);

  // Settings State
  const [settings, setSettings] = useState<Settings>({
    layout: "qwerty",
    sound: "mechanical",
    soundVolume: 60,
    caretStyle: "line",
    showVirtualKeyboard: true,
    showFingerGuide: true,
    fontSize: "base",
    fontFamily: "mono",
    theme: "dark",
    smoothCaret: true,
    strictMode: false,
    blindMode: false,
  });

  // Theme synchronization with document element
  useEffect(() => {
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.theme]);

  // Client side navigation handler
  const handleNavigate = useCallback((path: RoutePath) => {
    setCurrentPath(path);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Sync back/forward browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as RoutePath;
      const validPaths: RoutePath[] = [
        "/",
        "/dashboard",
        "/practice",
        "/drills",
        "/analytics",
        "/challenges",
        "/coach",
        "/ai-coach",
        "/leaderboard",
        "/profile",
        "/settings",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ];
      if (validPaths.includes(path)) {
        setCurrentPath(path);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Protected route enforcement and auth redirect
  useEffect(() => {
    if (!loading) {
      const isProtected = PROTECTED_ROUTES.includes(currentPath);
      if (isProtected && !user) {
        setRedirectTarget(currentPath);
        setCurrentPath("/login");
      } else if (user && (currentPath === "/login" || currentPath === "/register")) {
        // If the welcome transition is running, wait until it completes before routing away
        if (!welcomeUser) {
          setCurrentPath(redirectTarget || "/dashboard");
          setRedirectTarget(undefined);
        }
      }
    }
  }, [loading, user, currentPath, redirectTarget, welcomeUser]);

  // Handle completion of welcome boot transition -> now route to target or /dashboard
  const handleWelcomeComplete = () => {
    clearWelcome();
    if (currentPath === "/login" || currentPath === "/register") {
      handleNavigate(redirectTarget || "/dashboard");
      setRedirectTarget(undefined);
    }
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Toggle light/dark theme
  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
  };

  // Launch practice with override drill text
  const handleStartDrillText = (text: string) => {
    setDrillOverrideText(text);
    handleNavigate("/practice");
  };

  // Record completed session
  const handleCompleteSession = (session: SessionResult) => {
    recordSession(session);
  };

  return (
    <>
      {!loadingComplete && (
        <StagedLoadingScreen
          isReady={!loading}
          onComplete={() => {
            hasAppLoadedOnce = true;
            setLoadingComplete(true);
          }}
        />
      )}
      <div className="min-h-screen bg-[#050807] text-[#F3F5F2] bg-radial-atmosphere font-sans antialiased transition-colors duration-300 flex flex-col selection:bg-[#18C69A]/30 selection:text-white">
        {/* Welcome Transition Screen (Exclusive overlay during post-login boot) */}
        {welcomeUser && (
          <WelcomeTransition displayName={welcomeUser} onComplete={handleWelcomeComplete} />
        )}

        {/* Offline Status Banner */}
        <OfflineBanner />

        {/* Sticky Header Navbar */}
        <Navbar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
          userStats={{
            level: userStatsProfile.level,
            wpm: userStatsProfile.highestWpm,
            streak: userStatsProfile.streakDays,
          }}
        />

        {/* Main Page View Router */}
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
                <div className="w-10 h-10 border-4 border-[#18C69A]/30 border-t-[#18C69A] rounded-full animate-spin" />
                <p className="text-xs font-semibold text-[#A6ADA8]">Loading KEYFLOW...</p>
              </div>
            }
          >
            {currentPath === "/" && <HomePage onNavigate={handleNavigate} />}

            {currentPath === "/dashboard" && (
              <DashboardPage onNavigate={handleNavigate} onStartDrill={handleStartDrillText} />
            )}

            {currentPath === "/login" && (
              <LoginPage onNavigate={handleNavigate} redirectTo={redirectTarget} />
            )}

            {currentPath === "/register" && (
              <RegisterPage onNavigate={handleNavigate} redirectTo={redirectTarget} />
            )}

            {currentPath === "/forgot-password" && (
              <ForgotPasswordPage onNavigate={handleNavigate} />
            )}

            {currentPath === "/reset-password" && <ResetPasswordPage onNavigate={handleNavigate} />}

            {currentPath === "/practice" && (
              <PracticePage
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onCompleteSession={handleCompleteSession}
                onNavigate={handleNavigate}
                initialTextOverride={drillOverrideText}
              />
            )}

            {currentPath === "/drills" && (
              <DrillsPage onStartDrill={handleStartDrillText} onNavigate={handleNavigate} />
            )}

            {currentPath === "/analytics" && <AnalyticsPage onNavigate={handleNavigate} />}

            {currentPath === "/challenges" && (
              <ChallengesPage onStartChallenge={handleStartDrillText} onNavigate={handleNavigate} />
            )}

            {(currentPath === "/coach" || currentPath === "/ai-coach") && (
              <CoachPage onStartCustomWorkout={handleStartDrillText} onNavigate={handleNavigate} />
            )}

            {currentPath === "/leaderboard" && <LeaderboardPage onNavigate={handleNavigate} />}

            {currentPath === "/profile" && <ProfilePage onNavigate={handleNavigate} />}

            {currentPath === "/settings" && (
              <SettingsPage
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onNavigate={handleNavigate}
              />
            )}
          </Suspense>
        </main>

        {/* Footer */}
        {currentPath !== "/login" && <Footer onNavigate={handleNavigate} />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
