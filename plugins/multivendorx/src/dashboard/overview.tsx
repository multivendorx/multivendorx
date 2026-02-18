import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
} from 'recharts';
import axios from 'axios';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Analytics, Card, Column, Container, getApiLink, InfoItem } from 'zyra';
import { formatCurrency } from '@/services/commonFunction';

type Stat = {
	id: string | number;
	count: number | string;
	icon: string;
	label: string;
};
type Product = {
	id: number;
	title: string;
	price: string;
};
type OverviewProps = {
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

const Overview: React.FC<OverviewProps> = ({ }) => {
	const [commissionDetails, setCommissionDeatils] = useState<any[]>([]);
	const [earningSummary, setEarningSummary] = useState<any[]>([]);
	const [pieData, setPieData] = useState<any>([]);
	const [topCoupons, setTopCoupons] = useState<any[]>([]);
	const [topCustomers, setTopCustomers] = useState<any[]>([]);
	const [topStores, setTopStores] = useState<any[]>([]);

	const fetchCommissionDetails = async () => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'commission'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { format: 'reports', store_id: appLocalizer.store_id },
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
						label: 'Total Order Amount',
						count: formatCurrency(data.total_order_amount),
						icon: 'order',
					},
					{
						id: 'facilitator_fee',
						label: 'Facilitator Fee',
						count: formatCurrency(data.facilitator_fee),
						icon: 'facilitator',
					},
					{
						id: 'gateway_fee',
						label: 'Gateway Fee',
						count: formatCurrency(data.gateway_fee),
						icon: 'credit-card',
					},
					{
						id: 'shipping_amount',
						label: 'Shipping Amount',
						count: formatCurrency(data.shipping_amount),
						icon: 'shipping',
					},
					{
						id: 'tax_amount',
						label: 'Tax Amount',
						count: formatCurrency(data.tax_amount),
						icon: 'tax-compliance',
					},
					{
						id: 'shipping_tax_amount',
						label: 'Shipping Tax Amount',
						count: formatCurrency(data.shipping_tax_amount),
						icon: 'per-product-shipping',
					},
					{
						id: 'commission_total',
						label: 'Commission Total',
						count: formatCurrency(data.commission_total),
						icon: 'commission',
					},
					{
						id: 'commission_refunded',
						label: 'Commission Refunded',
						count: formatCurrency(data.commission_refunded),
						icon: 'marketplace-refund',
					},
				];

				// Just Admin + Store + Total for Revenue Breakdown
				const earningSummary = [
					{
						id: 'total_order_amount',
						title: 'Total Order Amount',
						price: formatCurrency(data.total_order_amount),
					},
					{
						id: 'admin_earning',
						title: 'Admin Net Earning',
						price: formatCurrency(adminEarning),
					},
					{
						id: 'store_earning',
						title: 'Store Net Earning',
						price: formatCurrency(storeEarning),
					},
					{
						id: 'facilitator_fee',
						title: 'Facilitator Fee',
						price: formatCurrency(data.facilitator_fee),
					},
					{
						id: 'gateway_fee',
						title: 'Gateway Fee',
						price: formatCurrency(data.gateway_fee),
					},
					{
						id: 'shipping_amount',
						title: 'Shipping Amount',
						price: formatCurrency(data.shipping_amount),
					},
					{
						id: 'tax_amount',
						title: 'Tax Amount',
						price: formatCurrency(data.tax_amount),
					},
					{
						id: 'shipping_tax_amount',
						title: 'Shipping Tax Amount',
						price: formatCurrency(data.shipping_tax_amount),
					},
					{
						id: 'commission_total',
						title: 'Commission Total',
						price: formatCurrency(data.commission_total),
					},
					{
						id: 'commission_refunded',
						title: 'Commission Refunded',
						price: formatCurrency(data.commission_refunded),
					},
					{
						id: 'grand_total',
						title: 'Grand Total',
						price: formatCurrency(adminEarning + storeEarning),
					},
				];

				const pieChartData = [
					{ name: 'Admin Net Earning', value: adminEarning },
					{ name: 'Store Net Earning', value: storeEarning },
					{
						name: 'Commission Refunded',
						value: data.commission_refunded,
					},
				];

				setCommissionDeatils(overviewData);
				setEarningSummary(earningSummary);
				setPieData(pieChartData);
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
			.catch(() => {
				// Handle error gracefully
			});
	};

	useEffect(() => {
		// Top selling coupons
		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				meta_key: 'multivendorx_store_id',
				per_page: 50, // get more so we can sort later
				orderby: 'date', // valid param, required by API
				order: 'desc',
			},
		})
			.then((response) => {
				// Sort coupons manually by usage_count (descending)
				const sortedCoupons = response.data
					.sort((a, b) => b.usage_count - a.usage_count)
					.slice(0, 5); // take top 5 only

				console.log('Top 5 Coupons:', sortedCoupons);
				setTopCoupons(sortedCoupons);
			})
			.catch((error) => {
				console.error('Error fetching top coupons:', error);
			});

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc-analytics/customers`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				per_page: 50, // fetch more customers so we can sort manually
				orderby: 'total_spend',
				order: 'desc',
			},
		})
			.then((response) => {
				// Sort by total_spend manually in case API doesn't enforce order
				const sortedCustomers = response.data
					.sort((a, b) => b.total_spend - a.total_spend)
					.slice(0, 5); // Top 5 customers only

				console.log('Top 5 Customers:', sortedCustomers);
				setTopCustomers(sortedCustomers);
			})
			.catch((error) => {
				console.error('Error fetching top customers:', error);
			});

		fetchCommissionDetails();
	}, []);
	console.log('site_url', appLocalizer.site_url);
	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Overview', 'multivendorx')}
					</div>
					<div className="des">
						{__(
							'Manage your store information and preferences',
							'multivendorx'
						)}
					</div>
				</div>
			</div>

			<Container>
				<Column>
					<Analytics
						variant="small"
						data={commissionDetails.map((item, idx) => ({
							icon: item.icon,
							iconClass: `admin-color${idx + 1}`,
							number: item.count,
							text: __(item.label, 'multivendorx'),
						}))}
					/>
				</Column>

				<Column grid={6}>
					<Card title={__('Revenue breakdown', 'multivendorx')}>
						{earningSummary.map((product) => (
							<>
								<InfoItem
									key={product.id}
									title={product.title}
									amount={product.price}
									// isLoading={isLoading}
								/>
							</>
						))}
					</Card>
				</Column>
				<Column grid={6}>
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
										label={({ name, percent }) =>
											`${__(name, 'multivendorx')} ${(
												percent * 100
											).toFixed(1)}%`
										}
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
			</Container >
		</>
	);
};

export default Overview;
