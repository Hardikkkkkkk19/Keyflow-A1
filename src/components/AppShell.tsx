import { lazy, Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "./common/ErrorBoundary";

const App = lazy(() => import("../App"));

function BootScreen() {
  return (
    <div className="min-h-screen bg-[#050807] flex items-center justify-center">
      <p className="text-xs font-mono tracking-[0.3em] text-[#18C69A] animate-pulse">KEYFLOW</p>
    </div>
  );
}

export function AppShell() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <BootScreen />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<BootScreen />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  );
}
