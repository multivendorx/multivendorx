import AddProductCom from './dashboard/addProducts';
import SpmvProducts from './dashboard/spmvProducts';

export interface DashboardRouteConfig {
  tab?: string;
  element?: string;
  component: React.ComponentType<any>;
}

export const DASHBOARD_ROUTES: DashboardRouteConfig[] = [
  {
    tab: 'products',
    element: 'add',
    component: SpmvProducts,
  },
  {
    tab: 'products',
    element: 'edit',
    component: AddProductCom,
  },
];