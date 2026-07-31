import PropTypes from "prop-types";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`relative inline-flex items-center p-1 rounded-full border border-background-light/80 bg-background-dark/60 backdrop-blur-md shadow-inner select-none ${className}`}
      role="radiogroup"
      aria-label="Theme selector"
    >
      {/* Light Option Button */}
      <button
        type="button"
        role="radio"
        aria-checked={!isDark}
        onClick={() => setTheme("light")}
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
        onClick={() => setTheme("dark")}
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
        className={`absolute top-1 bottom-1 rounded-full bg-background-light border border-border-light/80 shadow-md transition-all duration-300 ease-out pointer-events-none ${
          !isDark
            ? "left-1 w-[calc(50%-4px)]"
            : "left-[calc(50%+2px)] w-[calc(50%-4px)]"
        }`}
      />
    </div>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string,
};
