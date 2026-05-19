import React from 'react';
import { applyFilters } from '@wordpress/hooks';
import AddProductCom from './dashboard/addProducts';
import SharedListing from './dashboard/sharedListing';
import AddOrder from './dashboard/addOrder';
import OrderDetails from './dashboard/orderDetails';

export interface BaseDashboardProps {
	params?: Record<string, string>;
	query?: URLSearchParams;
}

export interface DashboardRouteConfig<P = Record<string, unknown>> {
	tab: string;
	element: string;
	component: React.ComponentType<P>;
}

const BASE_DASHBOARD_ROUTES: DashboardRouteConfig<BaseDashboardProps>[] = [
	{
		tab: 'products',
		element: 'add',
		component: SharedListing,
	},
	{
		tab: 'products',
		element: 'edit',
		component: AddProductCom,
	},
	{
		tab: 'orders',
		element: 'add',
		component: AddOrder,
	},
	{
		tab: 'orders',
		element: 'view',
		component: OrderDetails,
	},
];

export const getDashboardRoutes = (): DashboardRouteConfig[] => {
	return applyFilters(
		'multivendorx_dashboard_routes',
		BASE_DASHBOARD_ROUTES
	) as DashboardRouteConfig[];
};
