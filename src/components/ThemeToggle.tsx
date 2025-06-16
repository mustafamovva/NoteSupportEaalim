"use client";

import { useState, useEffect } from "react";

interface ThemeToggleProps {
  id?: string;
  onClick?: () => void;
}

export default function ThemeToggle({ id, onClick }: ThemeToggleProps) {
  // Track dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize on component mount
  useEffect(() => {
    // Check for stored preference or use system preference
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Set initial state based on localStorage or system preference
    const initialDarkMode = storedTheme === "dark" || (!storedTheme && prefersDark);
    setIsDarkMode(initialDarkMode);
    
    // Apply initial theme to document
    if (initialDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
    const html = document.documentElement;
    
    if (html.classList.contains("dark")) {
      // Switch to light mode
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      // Switch to dark mode
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
    
    // Call the provided onClick handler if it exists
    if (onClick) onClick();
  };
  
  // Just return the icon instead of a button
  return (
    <div 
      id={id}
      onClick={toggleTheme}
      className="p-2 text-gray-600 bg-gray-100 rounded-md transition-colors cursor-pointer dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      role="button"
      tabIndex={0}
      aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
    >
      {isDarkMode ? (
        // Sun icon for light mode (shown when currently in dark mode)
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        // Moon icon for dark mode (shown when currently in light mode)
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </div>
  );
}