"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { doc } from "firebase/firestore";

export default function ThemeToggleWithLable() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);
  const handleToggle = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }

    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center px-5 py-4 w-full text-sm font-medium tetx-gray-600 transition-colors duration-200 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <div className="flex justify-center items-center mr-3 w-5 h-5">
        <div className="p-0.5 rounded bg-gray-100 dark:bg-gray-700">
          <ThemeToggle id="theme-toggle-button" onClick={() => setIsDarkMode(!isDarkMode)} />
        </div>
      </div>
      <span>
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}