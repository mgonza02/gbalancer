// project imports
import { useEffect } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ThemeContextProvider } from './contexts/ThemeContext';
import AppRouter from './routes/AppRouter';
import ThemeCustomization from './themes';

function App() {
  // Update document theme attribute for CSS theming
  useEffect(() => {
    const updateThemeAttribute = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('gbalancer-theme-mode');
      const currentTheme = savedTheme || (isDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', currentTheme);
    };

    updateThemeAttribute();

    // Listen for storage changes (theme changes in other tabs)
    window.addEventListener('storage', updateThemeAttribute);

    return () => window.removeEventListener('storage', updateThemeAttribute);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeContextProvider>
        <ThemeCustomization>
          <AppRouter />
        </ThemeCustomization>
      </ThemeContextProvider>
    </ErrorBoundary>
  );
}

export default App;
