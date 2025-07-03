// ==============================|| THEME CONSTANT ||============================== //

export const APP_DEFAULT_PATH = '/dashboard/default';
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;

// Theme mode constants
export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const settings = {
  defaultMode: ThemeMode.LIGHT,
  defaultDirection: 'ltr',
  defaultContrast: 'default',
  defaultPresetColor: 'default',
  defaultNavColor: 'default',
  defaultLayout: 'vertical',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
};
