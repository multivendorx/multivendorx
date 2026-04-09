/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	ResponsiveContainer,
	Tooltip,
	Legend,
	PieChart,
	Pie,
	Cell,
} from 'recharts';
import axios from 'axios';
import {
	Analytics,
	Card,
	Column,
	Container,
	getApiLink,
	InfoItem,
	ComponentStatusView,
	useModules,
} from 'zyra';
import { formatCurrency } from '@/services/commonFunction';

type Stat = {
	id: string | number;
	count: number | string;
	icon: string;
	label: string;
};

type MarketplaceReportProps = {
	overview: Stat[];
	data: {
		month: string;
		revenue: number;
		net_sale: number;
		admin_amount: number;
	}[];
	overviewData: { name: string; orders: number; sold_out: number }[];
	pieData: { name: string; value: number }[];
	COLORS?: string[];
};

interface CommissionOverviewItem {
	id: string;
	label: string;
	count: number;
	formatted: string;
	icon: string;
	module?: string;
	condition?: boolean;
}

interface EarningSummaryItem {
	id: string;
	title: string;
	price: string;
	module?: string;
	condition?: boolean;
}

interface PieChartDataItem {
	name: string;
	value: number;
}

interface Coupon {
	id: number;
	code: string;
	usage_count: number;
	description?: string;
	amount: string;
	discount_type: string;
	store_name?: string;
}

interface Customer {
	user_id: number;
	name: string;
	username: string;
	email: string;
	orders_count: number;
	total_spend: number;
}

interface Store {
	store_id: number;
	store_name: string;
	commission_total: number;
	commission_refunded: number;
	total_order_amount: number;
}
const MarketplaceReport: React.FC<MarketplaceReportProps> = () => {
	const [commissionDetails, setCommissionDeatils] = useState<
		CommissionOverviewItem[]
	>([]);
	const [earningSummary, setEarningSummary] = useState<EarningSummaryItem[]>(
		[]
	);
	const [pieData, setPieData] = useState<PieChartDataItem>([]);
	const [topCoupons, setTopCoupons] = useState<Coupon[]>([]);
	const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
	const [topStores, setTopStores] = useState<Store[]>([]);
	const { modules } = useModules();
	const [isLoading, setIsLoading] = useState(true);

	const Counter = ({ value, duration = 1200, format }) => {
		const [count, setCount] = useState(0);

		useEffect(() => {
			let start = 0;
			const end = Number(value);
			if (isNaN(end)) {
				return;
			}

			const step = end / (duration / 16);

			const timer = setInterval(() => {
				start += step;
				if (start >= end) {
					start = end;
					clearInterval(timer);
				}
				setCount(start);
			}, 16);

			return () => clearInterval(timer);
		}, [value]);

		return <>{format ? format(count) : Math.floor(count)}</>;
	};

	const fetchCommissionDetails = async () => {
		setIsLoading(true);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'commission'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { format: 'reports' },
		})
			.then((response) => {
				const data = response.data;

				// Basic calculations
				const adminEarning =
					data.total_order_amount - data.commission_total;
				const storeEarning = data.commission_total;

				// Overview data (optional if you use it elsewhere)
				const overviewData = [
					{
						id: 'total_order_amount',
						label: __('Total Order Amount', 'multivendorx'),
						count: Number(data.total_order_amount),
						formatted: formatCurrency(data.total_order_amount),
						icon: 'order',
					},
					{
						id: 'facilitator_fee',
						label: __('Facilitator Fee', 'multivendorx'),
						count: Number(data.facilitator_fee),
						formatted: formatCurrency(data.facilitator_fee),
						icon: 'facilitator',
						module: 'facilitator',
					},
					{
						id: 'gateway_fee',
						label: __('Gateway Fee', 'multivendorx'),
						count: Number(data.gateway_fee),
						formatted: formatCurrency(data.gateway_fee),
						icon: 'credit-card',
						condition: false,
					},
					{
						id: 'shipping_amount',
						label: __('Shipping Amount', 'multivendorx'),
						count: Number(data.shipping_amount),
						formatted: formatCurrency(data.shipping_amount),
						icon: 'shipping',
						module: 'store-shipping',
					},
					{
						id: 'tax_amount',
						label: __('Tax Amount', 'multivendorx'),
						count: Number(data.tax_amount),
						formatted: formatCurrency(data.tax_amount),
						icon: 'tax-compliance',
						module: 'store-shipping',
					},
					{
						id: 'shipping_tax_amount',
						label: __('Shipping Tax Amount', 'multivendorx'),
						count: Number(data.shipping_tax_amount),
						formatted: formatCurrency(data.shipping_tax_amount),
						icon: 'per-product-shipping',
						module: 'store-shipping',
					},
					{
						id: 'commission_total',
						label: __('Commission Total', 'multivendorx'),
						count: Number(data.commission_total),
						formatted: formatCurrency(data.commission_total),
						icon: 'commission',
					},
					{
						id: 'commission_refunded',
						label: __('Commission Refunded', 'multivendorx'),
						count: Number(data.commission_refunded),
						formatted: formatCurrency(data.commission_refunded),
						icon: 'marketplace-refund',
						module: 'marketplace-refund',
					},
				].filter(
					(item) =>
						(!item.module || modules.includes(item.module)) &&
						(item.condition === undefined || item.condition)
				);

				// Just Admin + Store + Total for Revenue Breakdown
				const earningSummary = [
					{
						id: 'total_order_amount',
						title: __('Total Order Amount', 'multivendorx'),
						price: formatCurrency(data.total_order_amount),
					},
					{
						id: 'admin_earning',
						title: __('Admin Net Earning', 'multivendorx'),
						price: formatCurrency(adminEarning),
					},
					{
						id: 'store_earning',
						title: __('Store Net Earning', 'multivendorx'),
						price: formatCurrency(storeEarning),
					},
					{
						id: 'facilitator_fee',
						title: __('Facilitator Fee', 'multivendorx'),
						price: formatCurrency(data.facilitator_fee),
						module: 'facilitator',
					},
					{
						id: 'gateway_fee',
						title: __('Gateway Fee', 'multivendorx'),
						price: formatCurrency(data.gateway_fee),
						condition: false,
					},
					{
						id: 'shipping_amount',
						title: __('Shipping Amount', 'multivendorx'),
						price: formatCurrency(data.shipping_amount),
						module: 'store-shipping',
					},
					{
						id: 'tax_amount',
						title: __('Tax Amount', 'multivendorx'),
						price: formatCurrency(data.tax_amount),
						module: 'store-shipping',
					},
					{
						id: 'shipping_tax_amount',
						title: __('Shipping Tax Amount', 'multivendorx'),
						price: formatCurrency(data.shipping_tax_amount),
						module: 'store-shipping',
					},
					{
						id: 'commission_total',
						title: __('Commission Total', 'multivendorx'),
						price: formatCurrency(data.commission_total),
					},
					{
						id: 'commission_refunded',
						title: __('Commission Refunded', 'multivendorx'),
						price: formatCurrency(data.commission_refunded),
						module: 'marketplace-refund',
					},
					{
						id: 'grand_total',
						title: __('Grand Total', 'multivendorx'),
						price: formatCurrency(adminEarning + storeEarning),
					},
				].filter(
					(item) =>
						(!item.module || modules.includes(item.module)) &&
						(item.condition === undefined || item.condition)
				);

				const pieChartData = [
					{
						name: __('Admin Net Earning', 'multivendorx'),
						value: adminEarning,
					},
					{
						name: __('Store Net Earning', 'multivendorx'),
						value: storeEarning,
					},
					{
						name: __('Commission Refunded', 'multivendorx'),
						value: data.commission_refunded,
					},
				];

				setCommissionDeatils(overviewData);
				setEarningSummary(earningSummary);
				setPieData(pieChartData);
			})
			.finally(() => {
				setIsLoading(false);
			})
			.catch(() => {
				// Handle error gracefully
			});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'commission'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { format: 'reports', top_stores: 3 },
		})
			.then((response) => {
				setTopStores(response.data);
			})
			.finally(() => {
				setIsLoading(false);
			})
			.catch(() => {
				// Handle error gracefully
			});
	};

	useEffect(() => {
		setIsLoading(true);
		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				per_page: 100, // fetch enough to rank properly
			},
		})
			.then((response) => {
				const topSellingCoupons = response.data
					.filter((coupon) => Number(coupon.usage_count) > 0)
					.sort((a, b) => b.usage_count - a.usage_count)
					.slice(0, 3);

				setTopCoupons(topSellingCoupons);
			})
			.finally(() => {
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Error fetching top coupons:', error);
			});

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc-analytics/customers`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				per_page: 3, // only top 5
				orderby: 'total_spend', // server-side sort
				order: 'desc',
			},
		})
			.then((response) => {
				const filteredCustomers = response.data.filter((customer) => {
					return (
						customer.orders_count > 0 && customer.total_spend > 0
					);
				});

				setTopCustomers(filteredCustomers);
			})
			.finally(() => {
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Error fetching top customers:', error);
			});
	}, []);

	useEffect(() => {
		if (!modules) {
			return;
		}
		fetchCommissionDetails();
	}, [modules]);

	return (
		<>
			<Container>
				<Column>
					<Analytics
						cols={4}
						isLoading={isLoading}
						data={commissionDetails.map((item, idx) => ({
							icon: item.icon,
							iconClass: `admin-color${idx + 2}`,
							number: (
								<Counter
									value={item.count}
									format={formatCurrency}
								/>
							),
							text: __(item.label, 'multivendorx'),
						}))}
					/>
				</Column>

				<Column fullHeight row>
					<Card title={__('Revenue breakdown', 'multivendorx')}>
						{earningSummary.map((product) => (
							<InfoItem
								key={product.id}
								title={product.title}
								amount={product.price}
								isLoading={isLoading}
							/>
						))}
					</Card>
					<Card title={__('Revenue breakdown', 'multivendorx')}>
						<div style={{ width: '100%', height: 400 }}>
							<ResponsiveContainer>
								<PieChart>
									<Pie
										data={pieData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={140}
										innerRadius={80}
										// label={({ name, percent }) =>
										// 	`${name} ${(
										// 		percent * 100
										// 	).toFixed(1)}%`
										// }
										labelLine={false}
										isAnimationActive={true}
									>
										{pieData.map((_, index) => (
											<Cell
												key={`cell-${index}`}
												fill={
													[
														'#0088FE',
														'#00C49F',
														'#FF8042',
													][index % 3]
												}
											/>
										))}
									</Pie>
									<Tooltip
										formatter={(value) =>
											formatCurrency(value)
										}
										contentStyle={{
											backgroundColor: '#fff',
											borderRadius: '8px',
											border: '1px solid #ddd',
										}}
									/>
									<Legend
										verticalAlign="bottom"
										height={36}
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
					</Card>
				</Column>

				{/* Keep categories and brands */}
				<Column fullHeight row>
					<Card title={__('Top Selling Coupons', 'multivendorx')}>
						{topCoupons.length > 0 ? (
							topCoupons.map((coupon: Coupon, index: number) => (
								<InfoItem
									key={`store-${index}`}
									title={coupon.code}
									isLoading={isLoading}
									titleLink={`${appLocalizer.site_url}/wp-admin/post.php?post=${coupon.id}&action=edit`}
									avatar={{
										iconClass: 'coupon',
									}}
									descriptions={[
										{
											label: __('Used', 'multivendorx'),
											value: `${coupon.usage_count} ${__('times', 'multivendorx')}`,
										},
										{
											label: __('Store', 'multivendorx'),
											value: coupon.store_name,
										},
									]}
									amount={
										coupon.amount
											? coupon.discount_type === 'percent'
												? `${coupon.amount}%`
												: formatCurrency(coupon.amount)
											: '-'
									}
								/>
							))
						) : (
							<ComponentStatusView
								title={__(
									'No top coupons found.',
									'multivendorx'
								)}
							/>
						)}
					</Card>
					<Card title={__('Top Customers', 'multivendorx')}>
						{topCustomers.length > 0 ? (
							topCustomers.map(
								(customer: Customer, index: number) => (
									<InfoItem
										key={`store-${index}`}
										title={customer.username}
										isLoading={isLoading}
										titleLink={`${appLocalizer.site_url}//wp-admin/user-edit.php?user_id=${customer.user_id}&wp_http_referer=%2Fwp-admin%2Fusers.php`}
										avatar={{
											text: (
												customer.username
													?.trim()
													.charAt(0) || ''
											).toUpperCase(),
											iconClass: 'person',
											link: `${appLocalizer.site_url}/wp-admin/post.php?post=${coupon.id}&action=edit`,
										}}
										descriptions={[
											{
												label: __(
													'Orders',
													'multivendorx'
												),
												value:
													customer.orders_count || 0,
											},
											{
												label: __(
													'Email:',
													'multivendorx'
												),
												value: customer.email,
											},
										]}
										amount={formatCurrency(
											customer.total_spend || 0
										)}
									/>
								)
							)
						) : (
							<ComponentStatusView
								title={__(
									'No top customers found.',
									'multivendorx'
								)}
							/>
						)}
					</Card>
					<Card title={__('Top Stores', 'multivendorx')}>
						{topStores.length > 0 ? (
							topStores.map((store: Store, index: number) => (
								<>
									<InfoItem
										key={`store-${index}`}
										title={store.store_name || ''}
										isLoading={isLoading}
										titleLink={`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${store.store_id}/&subtab=store-overview`}
										avatar={{
											text: (
												store.store_name
													?.trim()
													.charAt(0) || ''
											).toUpperCase(),
											iconClass: 'storefront',
											link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${store.store_id}/&subtab=store-overview`,
										}}
										descriptions={[
											{
												label: __(
													'Commission',
													'multivendorx'
												),
												value: formatCurrency(
													store.commission_total || 0
												),
											},
											{
												label: __(
													'Refunded',
													'multivendorx'
												),
												value: formatCurrency(
													store.commission_refunded ||
														0
												),
											},
										]}
										amount={formatCurrency(
											store.total_order_amount || 0
										)}
									/>
								</>
							))
						) : (
							<ComponentStatusView
								title={__(
									'No top stores found.',
									'multivendorx'
								)}
							/>
						)}
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default MarketplaceReport;
