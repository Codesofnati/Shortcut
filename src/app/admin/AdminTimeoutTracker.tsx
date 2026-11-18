"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminTimeoutTracker() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds

  useEffect(() => {
    let lastActivity = Date.now();
    let timeoutId: NodeJS.Timeout;

    const updateActivity = () => {
      lastActivity = Date.now();
      // Set the cookie (middleware relies on this)
      document.cookie = `admin_last_active=${lastActivity}; path=/; max-age=${5 * 60}; SameSite=Lax`;
    };

    // Throttle mouse movements to avoid spamming the cookie update
    const handleActivity = () => {
      if (Date.now() - lastActivity > 5000) {
        updateActivity();
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Initial set
    updateActivity();

    // Timer to update the UI countdown every second
    const interval = setInterval(() => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - lastActivity) / 1000);
      const remaining = (5 * 60) - diffInSeconds;

      if (remaining <= 0) {
        clearInterval(interval);
        router.push("/admin-login?expired=true");
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearInterval(interval);
    };
  }, [router]);

  // Format as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-neutral-900 border border-white/10 px-4 py-2.5 rounded-full shadow-2xl text-xs font-bold text-neutral-300 backdrop-blur-xl">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      Session expires in: 
      <span className="text-amber-400 font-mono text-sm w-[38px] text-center">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
}