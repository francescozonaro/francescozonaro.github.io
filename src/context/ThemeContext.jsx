import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        return stored;
      }
      return "light";
    } catch {
      return "light"; // Default fallback to light mode
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
      root.style.backgroundColor = "#121110";
      root.style.color = "#f5f0eb";
    } else {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
      root.style.backgroundColor = "#f5f5f5";
      root.style.color = "#161616";
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.error("Failed to set theme in localStorage:", e);
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      try {
        const stored = localStorage.getItem("theme");
        if (!stored) {
          setTheme(e.matches ? "dark" : "light");
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 300);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
