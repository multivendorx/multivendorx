import {SettingsNavigator,  } from 'zyra';
import '../../dashboard/dashboardCommon.scss';
import { useLocation, Link } from 'react-router-dom';
import MarketplaceReport from './MarketplaceReport';
import ProductReport from './ProductReport';
import StoreReport from './StoreReport';
import OrderReport from './OrderReport';
import RefundedOrderReport from './RefundedOrderReport';
import { __ } from '@wordpress/i18n';

const Reports = () => {
	// Dummy chart data
	const data = [
		{ month: 'Jan', revenue: 4000, net_sale: 2400, admin_amount: 1200 },
		{ month: 'Feb', revenue: 3000, net_sale: 2000, admin_amount: 1000 },
		{ month: 'Mar', revenue: 4500, net_sale: 2800, admin_amount: 1300 },
		{ month: 'Apr', revenue: 5000, net_sale: 3200, admin_amount: 1500 },
		{ month: 'May', revenue: 4200, net_sale: 2500, admin_amount: 1400 },
		{ month: 'Jun', revenue: 4800, net_sale: 3000, admin_amount: 1600 },
		{ month: 'Jul', revenue: 5200, net_sale: 3400, admin_amount: 1700 },
		{ month: 'Aug', revenue: 4700, net_sale: 2900, admin_amount: 1500 },
	];

	const overviewData = [
		{ name: 'Jan', orders: 120, sold_out: 30 },
		{ name: 'Feb', orders: 90, sold_out: 20 },
		{ name: 'Mar', orders: 150, sold_out: 40 },
		{ name: 'Apr', orders: 170, sold_out: 35 },
		{ name: 'May', orders: 140, sold_out: 25 },
		{ name: 'Jun', orders: 180, sold_out: 50 },
		{ name: 'Jul', orders: 200, sold_out: 45 },
		{ name: 'Aug', orders: 160, sold_out: 30 },
	];

	const overview = [
		{
			id: 'earnings',
			label: 'No. of orders',
			count: '7896',
			icon: 'adminfont-order green',
		},
		{
			id: 'Vendors',
			label: 'Admin Commission',
			count: '85669',
			icon: 'adminfont-commission blue',
		},
		{
			id: 'Pending Withdrawals',
			label: 'Vendor Payout Pending',
			count: '88200',
			icon: 'adminfont-vendor-shipping red',
		},
		{
			id: 'Pending Withdrawals',
			label: 'Amount Refunds',
			count: '600',
			icon: 'adminfont-marketplace-refund green',
		},
		{
			id: 'Pending Withdrawals',
			label: 'No. of refunds',
			count: '600',
			icon: 'adminfont-calendar blue',
		},
	];
	const pieData = [
		{ name: 'Admin Net Earning', value: 1200 },
		{ name: 'Vendor Commission', value: 2400 },
		{ name: 'Vendor Net Commission', value: 800 },
		{ name: 'Sub Total', value: 200 },
		{ name: 'Shipping', value: 200 },
	];

	const location = new URLSearchParams(useLocation().hash.substring(1));

	const settingContent = [
		{
			type: 'file',
			content: {
				id: 'marketplace',
				headerTitle: 'Marketplace',
				headerIcon: 'marketplace-membership',
				hideSettingHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'products',
				headerTitle: 'Products',
				headerIcon: 'multi-product',
				hideSettingHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'stores',
				headerTitle: 'Stores',
				headerIcon: 'store-inventory',
				hideSettingHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'store-orders',
				headerTitle: 'Store Orders',
				headerIcon: 'order',
				hideSettingHeader: true,
			},
		},
		{
			type: 'file',
			content: {
				id: 'refunded-orders',
				headerTitle: 'Refunded Orders',
				headerIcon: 'marketplace-refund',
				hideSettingHeader: true,
			},
		},
	];

	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'marketplace':
				return (
					<MarketplaceReport
						overview={overview}
						data={data}
						overviewData={overviewData}
						pieData={pieData}
					/>
				);
			case 'products':
				return <ProductReport />;
			case 'stores':
				return <StoreReport />;
			case 'store-orders':
				return <OrderReport />;
			case 'refunded-orders':
				return <RefundedOrderReport />;
			default:
				return <div></div>;
		}
	};
	return (
		<>
			<SettingsNavigator
				settingContent={settingContent}
				currentSetting={location.get('subtab') as string}
				getForm={getForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=reports&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				variant={'compact'}
				menuIcon={true}
				headerIcon="report"
				headerTitle={__('Reports', 'multivendorx')}
				headerDescription={__('Track sales, earnings, and store performance with real-time marketplace insights.', 'multivendorx')}
			/>
		</>
	);
};

export default Reports;
