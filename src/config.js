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
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  currencySymbol: 'S/ '
};

export const defaultBalancerConfig = {
  numSellers: 150,
  customers: 500,
  minTerritoriesPerSeller: 2,
  territorySize: 1000,
  maxTerritories: 1000,
  maxCustomersPerPolygon: 500,
  minCustomersPerPolygon: 10,
  maxSalesPerTerritory: 70000,
  minSalesPerTerritory: 20
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
