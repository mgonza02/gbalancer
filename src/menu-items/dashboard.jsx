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

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'GCut Planner',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'new-planning',
      title: 'New Planning',
      type: 'item',
      url: '/new-planning',
      icon: icons.PlusOutlined,
      breadcrumbs: false
    },
    {
      id: 'view-historic',
      title: 'View Historic',
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

export default dashboard;
