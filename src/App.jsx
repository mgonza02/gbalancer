import { RouterProvider } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';
import { ThemeContextProvider } from 'contexts/ThemeContext';
import i18n from './i18n';

import ScrollTop from 'components/ScrollTop';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeContextProvider>
        <ThemeCustomization>
          <ScrollTop>
            <RouterProvider router={router} />
          </ScrollTop>
        </ThemeCustomization>
      </ThemeContextProvider>
    </I18nextProvider>
  );
}
