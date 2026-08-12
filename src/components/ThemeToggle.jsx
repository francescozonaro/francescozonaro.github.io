import { useState } from "react";
import PropTypes from "prop-types";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

// Default to light theme ("light-first" design).
// Check localStorage explicitly first, falling back to the DOM class list.
function getInitialThemeIsDark() {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch (e) {
    console.error("Failed to read theme from localStorage:", e);
  }
  return document.documentElement.classList.contains("dark-theme");
}

function applyTheme(isDark) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  if (isDark) {
    root.classList.add("dark-theme");
    root.classList.remove("light-theme");
  } else {
    root.classList.add("light-theme");
    root.classList.remove("dark-theme");
  }
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch (e) {
    console.error("Failed to save theme to localStorage:", e);
  }
  setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 300);
}

export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(getInitialThemeIsDark);

  const setThemeMode = (targetIsDark) => {
    if (isDark === targetIsDark) return;
    setIsDark(targetIsDark);
    applyTheme(targetIsDark);
  };

  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full border border-background-dark/80 bg-background-dark/60 backdrop-blur-md shadow-inner select-none ${className}`}
      role="radiogroup"
      aria-label="Theme selector"
    >
      {/* Light Option Button */}
      <button
        type="button"
        role="radio"
        aria-checked={!isDark}
        onClick={() => setThemeMode(false)}
        className={`relative z-10 px-2.5 py-1 rounded-full flex items-center space-x-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
          !isDark ? "text-primary" : "text-primary/50 hover:text-primary/80"
        }`}
      >
        <SunIcon
          className={`h-3.5 w-3.5 transition-transform duration-200 ${!isDark ? "text-secondary scale-110" : ""}`}
        />
        <span>Light</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={isDark}
        onClick={() => setThemeMode(true)}
        className={`relative z-10 px-2.5 py-1 rounded-full flex items-center space-x-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
          isDark ? "text-primary" : "text-primary/50 hover:text-primary/80"
        }`}
      >
        <MoonIcon
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isDark ? "text-secondary scale-110" : ""}`}
        />
        <span>Dark</span>
      </button>

      <div
        className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-background-dark border border-background-dark/80 shadow-md transition-transform duration-300 ease-out pointer-events-none ${
          !isDark ? "translate-x-0" : "translate-x-full"
        }`}
      />
    </div>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string,
};
