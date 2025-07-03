import { useTranslation } from 'react-i18next';

// assets
import { DashboardOutlined, PlusOutlined, HistoryOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  PlusOutlined,
  HistoryOutlined,
  UserOutlined,
  LoginOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD WITH i18n ||============================== //

export const useTranslatedMenuItems = () => {
  const { t } = useTranslation();

  const dashboard = {
    id: 'group-dashboard',
    title: t('nav.dashboard'),
    type: 'group',
    children: [
      {
        id: 'dashboard',
        title: t('nav.dashboard'),
        type: 'item',
        url: '/dashboard/default',
        icon: icons.DashboardOutlined,
        breadcrumbs: false
      },
      {
        id: 'new-planning',
        title: t('nav.newPlanning'),
        type: 'item',
        url: '/new-planning',
        icon: icons.PlusOutlined,
        breadcrumbs: false
      },
      {
        id: 'view-historic',
        title: t('nav.viewHistoric'),
        type: 'item',
        url: '/view-historic',
        icon: icons.HistoryOutlined,
        breadcrumbs: false
      },
      {
        id: 'register',
        title: 'Register',
        type: 'item',
        url: '/register',
        icon: icons.UserOutlined,
        breadcrumbs: false
      },
      {
        id: 'login',
        title: 'Login',
        type: 'item',
        url: '/login',
        icon: icons.LoginOutlined,
        breadcrumbs: false
      }
    ]
  };

  return { dashboard };
};

export default { dashboard: {} }; // Default export for compatibility
