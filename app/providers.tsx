"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { LazyMotion, domMax } from "framer-motion";
import { SplashScreen } from "@/components/SplashScreen";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("momo-theme") as Theme;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Hide splash after a delay to ensure GIF is seen and app is ready
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("momo-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <SplashScreen isVisible={showSplash} />
      <LazyMotion features={domMax}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: theme === "dark" ? "#1a1a1a" : "#fff",
              border: `1px solid ${theme === "dark" ? "#2d2d2d" : "#e2e8f0"}`,
              color: theme === "dark" ? "#fff" : "#0f172a",
            },
            success: {
              iconTheme: { primary: "#ff6500", secondary: "#fff" },
            },
          }}
        />
      </LazyMotion>
    </ThemeContext.Provider>
  );
}
