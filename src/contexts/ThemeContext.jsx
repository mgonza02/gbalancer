import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';

// Create theme context
const ThemeContext = createContext();

// Theme mode constants
export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Theme context provider
export const ThemeContextProvider = ({ children }) => {
  // Get initial theme from localStorage or default to light
  const getInitialTheme = () => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return ThemeMode.LIGHT;
    }

    const savedTheme = window.localStorage.getItem('gbalancer-theme-mode');
    if (savedTheme && Object.values(ThemeMode).includes(savedTheme)) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return ThemeMode.DARK;
    }

    return ThemeMode.LIGHT;
  };

  const [mode, setMode] = useState(ThemeMode.LIGHT); // Start with light mode for SSR safety

  // Initialize theme after component mounts
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setMode(initialTheme);
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode(prevMode => {
      const newMode = prevMode === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('gbalancer-theme-mode', newMode);
        document.documentElement.setAttribute('data-theme', newMode);
      }
      return newMode;
    });
  };

  // Set specific theme mode
  const setThemeMode = newMode => {
    if (Object.values(ThemeMode).includes(newMode)) {
      setMode(newMode);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('gbalancer-theme-mode', newMode);
        document.documentElement.setAttribute('data-theme', newMode);
      }
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = e => {
      const savedTheme = window.localStorage.getItem('gbalancer-theme-mode');
      if (!savedTheme) {
        setMode(e.matches ? ThemeMode.DARK : ThemeMode.LIGHT);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save theme preference and update document attribute
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gbalancer-theme-mode', mode);
      document.documentElement.setAttribute('data-theme', mode);
    }
  }, [mode]);

  const value = {
    mode,
    toggleTheme,
    setThemeMode,
    isDark: mode === ThemeMode.DARK,
    isLight: mode === ThemeMode.LIGHT
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

ThemeContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use theme context
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
};

export default ThemeContext;
