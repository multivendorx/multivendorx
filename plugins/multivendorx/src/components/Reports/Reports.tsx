import { SettingsNavigator } from 'zyra';
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
		{ name: __('Jan', 'multivendorx'), orders: 120, sold_out: 30 },
		{ name: __('Feb', 'multivendorx'), orders: 90, sold_out: 20 },
		{ name: __('Mar', 'multivendorx'), orders: 150, sold_out: 40 },
		{ name: __('Apr', 'multivendorx'), orders: 170, sold_out: 35 },
		{ name: __('May', 'multivendorx'), orders: 140, sold_out: 25 },
		{ name: __('Jun', 'multivendorx'), orders: 180, sold_out: 50 },
		{ name: __('Jul', 'multivendorx'), orders: 200, sold_out: 45 },
		{ name: __('Aug', 'multivendorx'), orders: 160, sold_out: 30 },
	];

	const overview = [
		{
			id: 'total_orders',
			label: __('No. of Orders', 'multivendorx'),
			count: '7896',
			icon: 'adminfont-order green',
		},
		{
			id: 'admin_commission',
			label: __('Admin Commission', 'multivendorx'),
			count: '85669',
			icon: 'adminfont-commission blue',
		},
		{
			id: 'vendor_payout_pending',
			label: __('Vendor Payout Pending', 'multivendorx'),
			count: '88200',
			icon: 'adminfont-vendor-shipping red',
		},
		{
			id: 'amount_refunds',
			label: __('Amount Refunds', 'multivendorx'),
			count: '600',
			icon: 'adminfont-marketplace-refund green',
		},
		{
			id: 'total_refunds',
			label: __('No. of Refunds', 'multivendorx'),
			count: '600',
			icon: 'adminfont-calendar blue',
		},
	];
	const pieData = [
		{ name: __('Admin Net Earning', 'multivendorx'), value: 1200 },
		{ name: __('Vendor Commission', 'multivendorx'), value: 2400 },
		{ name: __('Vendor Net Commission', 'multivendorx'), value: 800 },
		{ name: __('Sub Total', 'multivendorx'), value: 200 },
		{ name: __('Shipping', 'multivendorx'), value: 200 },
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
				headerDescription={__(
					'Track sales, earnings, and store performance with real-time marketplace insights.',
					'multivendorx'
				)}
			/>
		</>
	);
};

export default Reports;
