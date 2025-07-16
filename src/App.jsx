// project imports
import { ThemeContextProvider } from './contexts/ThemeContext';
import AppRouter from './routes/AppRouter';
import ThemeCustomization from './themes';

function App() {
  return (
    <ThemeContextProvider>
      <ThemeCustomization>
        <AppRouter />
      </ThemeCustomization>
    </ThemeContextProvider>
  );
}

export default App;
