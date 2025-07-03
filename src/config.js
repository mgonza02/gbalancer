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

export const defaultBalancerConfig = {
  numSellers: 2,
  customers: 500,
  minTerritoriesPerSeller: 6,
  territorySize: 1000,
  maxTerritories: 60,
  maxCustomersPerPolygon: 55,
  minCustomersPerPolygon: 10,
  maxSalesPerTerritory: 20000
  /*
  For next version, we will add the following properties to the config:
  maxOversizedTerritories: 5,
  maxOversizedCustomers: 100,
  maxOversizedTerritoriesPerSeller: 2,
  maxOversizedCustomersPerSeller: 50,
  maxOversizedTerritoriesPerPolygon: 3,
  maxOversizedCustomersPerPolygon: 20,
  maxOversizedTerritoriesPerPolygonPerSeller: 1,
  maxOversizedCustomersPerPolygonPerSeller: 10,
*/
};
