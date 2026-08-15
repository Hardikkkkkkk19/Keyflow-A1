import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full border text-xs font-bold shadow-lg transition-all duration-300 flex items-center gap-2 ${
        isOffline
          ? "bg-amber-900/90 text-amber-200 border-amber-700/80 backdrop-blur-md"
          : "bg-[#181818]/90 text-[#18C69A] border-[#18C69A]/40 backdrop-blur-md"
      }`}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>You are currently offline. Practice mode is still available locally.</span>
        </>
      ) : (
        <>
          <Wifi className="w-3.5 h-3.5 text-[#18C69A]" />
          <span>Connection restored. KEYFLOW is back online.</span>
        </>
      )}
    </div>
  );
};
