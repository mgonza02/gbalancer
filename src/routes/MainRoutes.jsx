import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - cutting planner pages
const NewPlanning = Loadable(lazy(() => import('pages/cutting-planner/new-planning')));
const ViewHistoric = Loadable(lazy(() => import('pages/cutting-planner/view-historic')));

// render - test pages
const VisualizationTest = Loadable(lazy(() => import('pages/test/visualization-test')));
const PDFExportTest = Loadable(lazy(() => import('pages/test/pdf-export-test')));
const CuttingAlgorithmTest = Loadable(lazy(() => import('pages/test/cutting-algorithm-test')));

// render - auth pages (these should be in AuthLayout, not Dashboard)
// const Login = Loadable(lazy(() => import('pages/auth/Login')));
// const Register = Loadable(lazy(() => import('pages/auth/Register')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'new-planning',
      element: <NewPlanning />
    },
    {
      path: 'view-historic',
      element: <ViewHistoric />
    },
    {
      path: 'visualization-test',
      element: <VisualizationTest />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'pdf-export-test',
      element: <PDFExportTest />
    },
    {
      path: 'cutting-algorithm-test',
      element: <CuttingAlgorithmTest />
    }
  ]
};

export default MainRoutes;
