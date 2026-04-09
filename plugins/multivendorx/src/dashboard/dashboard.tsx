/* global appLocalizer */
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from 'recharts';
import React, { useState, useEffect } from 'react';
import '../components/dashboard.scss';
import '../dashboard/dashboard1.scss';
import {
	ButtonInputUI,
	Analytics,
	Card,
	Column,
	Container,
	getApiLink,
	InfoItem,
	ComponentStatusView,
	useModules,
	TableCard,
	NavigatorHeader,
	CalendarInputUI,
	TableRow,
	ItemListUI,
} from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	dashNavigate,
	formatCurrency,
	formatDate,
	formatTimeAgo,
	truncateText,
} from '@/services/commonFunction';
import VisitorsMap from './visitorsMap';
import { useNavigate } from 'react-router-dom';

const getCSSVar = (name) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const themeColors = [
	getCSSVar('--colorPrimary'),
	getCSSVar('--colorSecondary'),
	getCSSVar('--colorAccent'),
	getCSSVar('--colorSupport'),
];

const BarChartData = [
	{ name: 'Sales', dataKey: 'total_order_amount', color: themeColors[0] },
	{ name: 'Earnings', dataKey: 'store_earnings', color: themeColors[1] },
	{ name: 'Orders', dataKey: 'orders', color: themeColors[2] },
];

interface DateRange {
	startDate: Date;
	endDate: Date;
}

const Dashboard: React.FC = () => {
	const [review, setReview] = useState<[]>([]);
	const [pendingRefund, setPendingRefund] = useState<[]>([]);
	const [announcement, setAnnouncement] = useState<[]>([]);
	const [revenueData, setRevenueData] = useState([]);
	const [store, setStore] = useState<[]>([]);
	const [storePreviousYear, setStorePreviousYear] = useState<[]>([]);
	const [customers, setCustomers] = useState<[]>([]);
	const [lastWithdraws, setLastWithdraws] = useState<[]>([]);
	const [activities, setActivities] = useState<[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [dateRange, setDateRange] = useState<DateRange>({
		startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		endDate: new Date(),
	});

	const { modules } = useModules();

	// Table data states - only for tables that need TableCard
	const [recentOrderRows, setRecentOrderRows] = useState<TableRow[][]>([]);
	const [recentOrderIds, setRecentOrderIds] = useState<number[]>([]);
	const [topProductRows, setTopProductRows] = useState<TableRow[][]>([]);
	const [topProductIds, setTopProductIds] = useState<number[]>([]);
	const navigate = useNavigate();
	const access =
		appLocalizer.settings_databases_value?.['privacy']?.[
			'customer_information_access'
		];
	const siteUrl = appLocalizer.site_url.replace(/\/$/, '');

	// Table headers
	const recentOrderHeaders = {
		id: {
			label: __('Order ID', 'multivendorx'),
			render: (row) => (
				<span
					onClick={() =>
						dashNavigate(navigate, [
							'orders',
							'view',
							String(row.id),
						])
					}
					className='link-item'
				>
					#{row.id}
				</span>
			),
		},
		date_created: {
			label: __('Date', 'multivendorx'),
			type: 'date',
		},
		products: {
			label: __('Product Name', 'multivendorx'),
			width: 14,
			render: (row) =>
				row.line_items?.length
					? row.line_items.map((item) => (
							<InfoItem
								key={item.id}
								title={item.name}
								onClick={() =>
									dashNavigate(navigate, [
										'products',
										'edit',
										String(item.product_id),
									])
								}
								avatar={{
									image: item.image?.src || '',
									iconClass: item.image?.src
										? ''
										: 'single-product',
								}}
								descriptions={[
									{
										label: __('Qty:', 'multivendorx'),
										value: item.quantity,
									},
								]}
							/>
						))
					: '-',
		},
		total: {
			label: __('Total', 'multivendorx'),
			type: 'currency',
		},
		status: {
			label: __('Order Status', 'multivendorx'),
			type: 'status',
		},
	};
	const topProductHeaders = {
		name: {
			label: __('Product Name', 'multivendorx'),
			width: 18,
			render: (row) => {
				return (
					<InfoItem
						title={row.name}
						onClick={() =>
							dashNavigate(navigate, [
								'products',
								'edit',
								String(row.id),
							])
						}
						avatar={{
							image: row.images?.[0]?.src || '',
							iconClass: row.images?.[0]?.src
								? ''
								: 'single-product',
						}}
						descriptions={[
							{
								label: __('SKU:', 'multivendorx'),
								value: row.sku || '—',
							},
						]}
					/>
				);
			},
		},
		total_sales: {
			label: __('Sales', 'multivendorx'),
		},
	};
	// Helper function to get dynamic greeting
	const getGreeting = () => {
		const hour = new Date().getHours();

		if (hour >= 5 && hour < 12) {
			return __('Good Morning', 'multivendorx');
		}

		if (hour >= 12 && hour < 17) {
			return __('Good Afternoon', 'multivendorx');
		}

		if (hour >= 17 && hour < 21) {
			return __('Good Evening', 'multivendorx');
		}

		return __('Good Night', 'multivendorx');
	};
	useEffect(() => {
		// Current range
		axios
			.get(getApiLink(appLocalizer, `store/${appLocalizer.store_id}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					dashboard: true,
					id: appLocalizer.store_id,
					start_date: dateRange?.startDate,
					end_date: dateRange?.endDate,
				},
			})
			.then((res) => {
				setStore(res.data || {});
			});

		// Previous year range
		axios
			.get(getApiLink(appLocalizer, `store/${appLocalizer.store_id}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					dashboard: true,
					id: appLocalizer.store_id,
					start_date: new Date(
						new Date(dateRange?.startDate).setFullYear(
							new Date(dateRange?.startDate).getFullYear() - 1
						)
					),
					end_date: new Date(
						new Date(dateRange?.endDate).setFullYear(
							new Date(dateRange?.endDate).getFullYear() - 1
						)
					),
				},
			})
			.then((res) => {
				setStorePreviousYear(res.data || {});
			});
	}, [dateRange]);

	useEffect(() => {
		setIsLoading(true);

		// Reviews
		if (modules.includes('store-review')) {
			axios
				.get(getApiLink(appLocalizer, 'review'), {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						page: 1,
						row: 4,
						store_id: appLocalizer.store_id,
						orderBy: 'date_created',
						order: 'desc',
						startDate: dateRange.startDate,
						endDate: dateRange.endDate,
						dashboard: true,
					},
				})
				.then((response) => {
					const items = response.data || [];
					setReview(items);
				})
				.catch(() => {
					setReview([]);
				});
		}

		// Pending Refunds
		if (modules.includes('marketplace-refund')) {
			axios
				.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
						status: 'refund-requested',
						page: 1,
						per_page: 4,
						orderby: 'date',
						order: 'desc',
						after: dateRange.startDate
							.toISOString()
							.replace('Z', ''),
						before: dateRange.endDate
							.toISOString()
							.replace('Z', ''),
					},
				})
				.then((response) => {
					const items = response.data || [];
					const formatData = items.map((order) => ({
						id: order.id,
						name: `${order.billing.first_name} ${order.billing.last_name}`,
						reason:
							order.meta_data.find(
								(m) => m.key === '_customer_refund_reason'
							)?.value || 'No reason',
						time: order.date_created,
						amount: order.total,
					}));
					setPendingRefund(formatData);
				})
				.catch(() => {
					setPendingRefund([]);
				});
		}

		// Announcements
		if (modules.includes('announcement')) {
			axios
				.get(getApiLink(appLocalizer, 'announcement'), {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						page: 1,
						row: 5,
						store_id: appLocalizer.store_id,
						status: 'publish',
					},
				})
				.then((response) => {
					setAnnouncement(response.data || []);
				})
				.catch(() => {
					setAnnouncement([]);
				});
		}

		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 5,
					meta_key: 'multivendorx_store_id',
					orderby: 'popularity',
					order: 'desc',
					value: appLocalizer.store_id,
					after: dateRange.startDate.toISOString().replace('Z', ''),
					before: dateRange.endDate.toISOString().replace('Z', ''),
				},
			})
			.then((response) => {
				const products = response.data;

				// keep only products that have sales
				const topProducts = products.filter(
					(p) => parseInt(p.total_sales) > 0
				);

				// store full product response
				setTopProductRows(topProducts);

				// only store ids separately
				setTopProductIds(topProducts.map((p) => p.id));
			});

		// Recent Orders
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 5,
					order: 'desc',
					orderby: 'date',
					meta_key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
					status: ['pending', 'processing', 'completed', 'on-hold'],
					after: dateRange.startDate.toISOString().replace('Z', ''),
					before: dateRange.endDate.toISOString().replace('Z', ''),
				},
			})
			.then((response) => {
				const orders = response.data;

				setRecentOrderRows(orders);
				setRecentOrderIds(orders.map((o) => o.id));
			});

		// Last Withdrawals - keep using InfoItem (no TableCard needed)
		axios
			.get(getApiLink(appLocalizer, 'transaction'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: 1,
					row: 5,
					store_id: appLocalizer.store_id,
					transaction_type: 'Withdrawal',
					transaction_status: 'Completed',
					orderBy: 'created_at',
					order: 'DESC',
					start_date: dateRange.startDate,
					end_date: dateRange.endDate,
				},
			})
			.then((response) => {
				const withdrawals = response.data || [];
				setLastWithdraws(withdrawals);
			})
			.catch(() => setLastWithdraws([]));

		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 50, // Reduced from 100; 50 is usually plenty to find 5 unique users
					status: 'completed,processing', // WC REST API often prefers comma-separated strings for status
					meta_key: 'multivendorx_store_id',
					meta_value: appLocalizer.store_id,
					after: dateRange.startDate.toISOString().split('.')[0], // Cleaner ISO format
					before: dateRange.endDate.toISOString().split('.')[0],
					_fields: 'id,customer_id,billing', // ONLY fetch what you need to identify the customer
				},
			})
			.then(({ data }) => {
				if (!Array.isArray(data)) {
					setCustomers([]);
					return;
				}

				const seen = new Set();
				const uniqueCustomers = [];

				for (const order of data) {
					const identifier =
						order.customer_id !== 0
							? order.customer_id
							: order.billing?.email;

					if (identifier && !seen.has(identifier)) {
						seen.add(identifier);
						uniqueCustomers.push(order);
					}

					if (uniqueCustomers.length === 5) {
						break;
					}
				}
				setCustomers(uniqueCustomers);
			})
			.catch((err) => {
				console.error('Failed to fetch customers:', err);
				setCustomers([]);
			});

		// Activities
		axios
			.get(getApiLink(appLocalizer, 'notifications'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: 1,
					row: 5,
					store_id: appLocalizer?.store_id,
					start_date: dateRange.startDate,
					end_date: dateRange.endDate,
				},
			})
			.then((response) => {
				setActivities(response.data || []);
			})
			.catch(() => {
				setActivities([]);
			})
			.finally(() => {
				setIsLoading(false);
			});

		// Revenue Data
		axios
			.get(getApiLink(appLocalizer, 'commission'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					format: 'reports',
					store_id: appLocalizer.store_id,
					dashboard: true,
					start_date: dateRange.startDate,
					end_date: dateRange.endDate,
				},
			})
			.then((response) => {
				setRevenueData(response.data || []);
			});
	}, [dateRange, modules]);

	const analyticsData = [
		{
			icon: 'dollar',
			number: formatCurrency(store?.commission?.total_order_amount || 0),
			text: 'Total Revenue',
			color: 'primary',
			prev30: formatCurrency(
				storePreviousYear?.commission?.total_order_amount || 0
			),
		},
		{
			icon: 'order',
			number: store?.commission?.order_count || 0,
			text: 'Total Orders',
			color: 'secondary',
			prev30: storePreviousYear?.commission?.order_count || 0,
		},
		{
			icon: 'search-discovery',
			number: store?.visitors,
			text: 'Store Views',
			color: 'accent',
			prev30: storePreviousYear?.visitors,
		},
		{
			icon: 'commission',
			number: formatCurrency(store?.commission?.commission_total || 0),
			text: 'Commission Earned',
			color: 'support',
			prev30: formatCurrency(
				storePreviousYear?.commission?.commission_total || 0
			),
		},
	];

	const chartData = [
		{
			name: 'Commission Earned',
			value: Number(store?.commission?.commission_total || 0),
			color: themeColors[0],
		},
		{
			name: 'Commission Refunded',
			value: Number(store?.commission?.commission_refunded || 0),
			color: themeColors[1],
		},
		{
			name: 'Total Revenue',
			value: Number(store?.commission?.total_order_amount || 0),
			color: themeColors[2],
		},
	];
	return (
		<>
			<NavigatorHeader
				headerTitle={`${getGreeting()}, ${store?.primary_owner_info?.data?.display_name}!`}
				headerDescription={
					<>
						{__('You’re viewing:', 'multivendorx')}{' '}
						<b>
							{store?.primary_owner_info?.data?.display_name}’s{' '}
							{store?.name || '-'}
						</b>
					</>
				}
				headerCustomContent={
					<CalendarInputUI
						value={dateRange}
						onChange={(range: DateRange) => {
							setDateRange({
								startDate: range.startDate,
								endDate: range.endDate,
							});
						}}
					/>
				}
			/>
			<Container className='store-dashboard'>
				<Column>
					<Analytics
						variant="dashboard"
						data={analyticsData.map((item) => ({
							icon: item.icon,
							iconClass: `${item.color}-bg`,
							isLoading: isLoading,
							colorClass: item.color,
							number: item.number,
							text: __(item.text, 'multivendorx'),
							extra: (
								<>
									<div>
										{__('Last 30 days:', 'multivendorx')}{' '}
										<span className={`${item.color}-color`}>
											{item.last30}
										</span>
									</div>
									<div>
										{__(
											'Previous 30 days:',
											'multivendorx'
										)}{' '}
										<span className={`${item.color}-color`}>
											{item.prev30}
										</span>
									</div>
								</>
							),
						}))}
					/>
				</Column>

				<Column fullHeight grid={8}>
					<Card title={__('Sales Overview', 'multivendorx')}>
						{revenueData && revenueData.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<BarChart
									data={revenueData}
									barSize={12}
									barCategoryGap="20%"
								>
									<CartesianGrid
										stroke="#f0f0f0"
										vertical={false}
									/>
									<XAxis
										dataKey="month"
										axisLine={false}
										tickLine={false}
									/>
									<YAxis axisLine={false} tickLine={false} />
									<Tooltip
										contentStyle={{
											background: '#fff',
											border: 'none',
											borderRadius: '3px',
											boxShadow:
												'0 2px 6px rgba(0,0,0,0.08)',
										}}
									/>
									<Legend />
									{BarChartData.map((entry) => (
										<Bar
											key={entry.dataKey}
											dataKey={entry.dataKey}
											fill={entry.color}
											radius={[6, 6, 0, 0]}
											name={__(
												entry.name,
												'multivendorx'
											)}
										/>
									))}
									<YAxis
										yAxisId={1}
										orientation="right"
										axisLine={false}
										tickLine={false}
										tickFormatter={(v) => `${v}%`}
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<ComponentStatusView
								title={__('No sales found.', 'multivendorx')}
							/>
						)}
					</Card>
				</Column>

				<Column fullHeight grid={4}>
					<Card title={__('Last Withdrawal', 'multivendorx')}>
						<div className="top-customer-wrapper">
							{lastWithdraws && lastWithdraws.length > 0 ? (
								lastWithdraws.map((item) => (
									<InfoItem
										key={item.id}
										title={
											item.payment_method ===
											'stripe-connect'
												? __('Stripe', 'multivendorx')
												: item.payment_method ===
													  'bank-transfer'
													? __(
															'Direct to Local Bank (INR)',
															'multivendorx'
														)
													: item.payment_method ===
														  'paypal-payout'
														? __(
																'PayPal',
																'multivendorx'
															)
														: ''
										}
										isLoading={isLoading}
										descriptions={[{ value: item.date }]}
										amount={formatCurrency(item.amount)}
									/>
								))
							) : (
								<div className="no-data">
									{__(
										'No withdrawals found.',
										'multivendorx'
									)}
								</div>
							)}
						</div>

						{lastWithdraws && lastWithdraws.length > 0 && (
							<ButtonInputUI
								buttons={{
									icon: 'preview',
									text: __(
										'View transaction history',
										'multivendorx'
									),
									onClick: () => {
										window.open(
											'/dashboard/wallet/transactions/'
										);
									},
								}}
							/>
						)}
					</Card>
				</Column>

				<Column fullHeight grid={4}>
					<Card title={__('Visitors Map', 'multivendorx')}>
						<VisitorsMap dateRange={dateRange} />
					</Card>
				</Column>

				<Column fullHeight grid={8}>
					<Card
						title={__('Recent Orders', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							const url = appLocalizer.permalink_structure
								? `${siteUrl}/${appLocalizer.dashboard_slug}/orders`
								: `${siteUrl}/?page_id=${appLocalizer.dashboard_page_id}&segment=orders`;
							window.open(url);
						}}
					>
						{recentOrderRows.length > 0 ? (
							<TableCard
								headers={recentOrderHeaders}
								rows={recentOrderRows}
								isLoading={isLoading}
								ids={recentOrderIds}
								className="transparent-table"
								showMenu={false}
								showColumnToggleIcon={false}
								format={appLocalizer.date_format}
								currency={{
									currencySymbol:
										appLocalizer.currency_symbol,
									priceDecimals: appLocalizer.price_decimals,
									decimalSeparator:
										appLocalizer.decimal_separator,
									thousandSeparator:
										appLocalizer.thousand_separator,
									currencyPosition:
										appLocalizer.currency_position,
								}}
							/>
						) : (
							<div className="no-data">
								{__('No products found.', 'multivendorx')}
							</div>
						)}
					</Card>
				</Column>

				{/* Best-Selling Products */}
				<Column fullHeight grid={6}>
					<Card
						title={__('Best-Selling Products', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							const url = appLocalizer.permalink_structure
								? `${siteUrl}/${appLocalizer.dashboard_slug}/products`
								: `${siteUrl}/?page_id=${appLocalizer.dashboard_page_id}&segment=products`;
							window.open(url);
						}}
					>
						{topProductRows.length > 0 ? (
							<TableCard
								headers={topProductHeaders}
								rows={topProductRows}
								isLoading={isLoading}
								ids={topProductIds}
								className="transparent-table"
								showMenu={false}
								showColumnToggleIcon={false}
							/>
						) : (
							<div className="no-data">
								{__('No sales data yet', 'multivendorx')}
							</div>
						)}
					</Card>
				</Column>

				{/* Commission Overview */}
				<Column fullHeight grid={6}>
					<Card
						title={__('Commission Overview', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							const url = appLocalizer.permalink_structure
								? `${siteUrl}/${appLocalizer.dashboard_slug}/overview`
								: `${siteUrl}/?page_id=${appLocalizer.dashboard_page_id}&segment=overview`;
							window.open(url);
						}}
					>
						<div style={{ width: '100%', height: 400 }}>
							<ResponsiveContainer>
								<PieChart>
									<Pie
										data={chartData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={140}
										innerRadius={80}
										label={({ name, percent }) =>
											`${name} ${(percent * 100).toFixed(1)}%`
										}
										labelLine={false}
										isAnimationActive
									>
										{chartData.map((item, index) => (
											<Cell
												key={`cell-${index}`}
												fill={item.color}
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
				{/* Admin Announcements */}
				{modules.includes('announcement') && (
					<Column fullHeight grid={4}>
						<Card
							title={__('Admin Announcements', 'multivendorx')}
							iconName="external icon"
							onIconClick={() => {
								const url = appLocalizer.permalink_structure
									? `${siteUrl}/${appLocalizer.dashboard_slug}/view-notifications#subtab=announcements`
									: `${siteUrl}/?page_id=${appLocalizer.dashboard_page_id}&segment=view-notifications#subtab=announcements`;
								window.open(url, '_blank');
							}}
						>
							{Array.isArray(announcement) && announcement.length > 0 ? (
								<ItemListUI
									className="notification-wrapper"
									items={announcement.map((item, index) => ({
										id: item.id || index,
										title: item.title,
										desc: item.content,
										icon: `form-paypal-email admin-badge admin-color${index + 2}`,
										value: formatTimeAgo(item.date_created),
									}))}
								/>
							) : (
								<ComponentStatusView title={__('No announcements found.', 'multivendorx')}
							/>
							)}
						</Card>
					</Column>
				)}
				{modules.includes('marketplace-refund') && (
					<Column fullHeight grid={4}>
						<Card
							title={__('Pending Refunds', 'multivendorx')}
							iconName="external icon"
							onIconClick={() => {
								const url = appLocalizer.permalink_structure
									? `${siteUrl}/${appLocalizer.dashboard_slug}/refund`
									: `${siteUrl}/?page_id=${appLocalizer.dashboard_page_id}&segment=refund`;
								window.open(url);
							}}
						>
							<div className="top-customer-wrapper">
								{pendingRefund && pendingRefund.length > 0 ? (
									pendingRefund.map((customer) => (
										<div
											key={customer.id}
											className="customer"
										>
											<div className="left-section">
												<div className="details">
													<div className="name">
														{customer.name}
													</div>
													<div className="order-number">
														{customer.reason} |{' '}
														{formatDate(
															customer.time
														)}
													</div>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="no-data">
										{__(
											'No pending refunds found.',
											'multivendorx'
										)}
									</div>
								)}
							</div>
						</Card>
					</Column>
				)}
				{modules.includes('privacy') &&
					Array.isArray(access) &&
					access.includes('name') && (
						<Column fullHeight grid={4}>
							<Card title={__('Top Customers', 'multivendorx')}>
								{customers && customers.length > 0 ? (
									customers.map((order, index) => {
										const name =
											`${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim() ||
											__('Guest', 'multivendorx');
										return (
											<InfoItem
												key={index}
												title={name}
												avatar={{
													text: name
														.charAt(0)
														.toUpperCase(),
													iconClass: 'person',
												}}
											/>
										);
									})
								) : (
									<ComponentStatusView title={__('No customers found.', 'multivendorx')} />
								)}
							</Card>
						</Column>
					)}
				<Column fullHeight grid={4}>
					<Card title={__('Store Activity', 'multivendorx')}>
						<div className="activity-log">
							{Array.isArray(activities) &&
							activities.length > 0 ? (
								activities.slice(0, 5).map((a, i) => (
									<div key={i} className="activity">
										<div className="title">{a.title}</div>
										<div className="des">{a.message}</div>
										<span>{formatDate(a.created_at)}</span>
									</div>
								))
							) : (
								<ComponentStatusView title={__('No activity found.', 'multivendorx')} />
							)}
						</div>
					</Card>
				</Column>
				{modules.includes('store-review') && (
					<Column fullHeight grid={4}>
						<Card
							title={__('Latest Reviews', 'multivendorx')}
							iconName="external icon"
							onIconClick={() => {
								const url = appLocalizer.permalink_structure
									? `${siteUrl}/${appLocalizer.dashboard_slug}/store-review`
									: `${siteUrl}/?page_id=${appLocalizer.dashboard_page_id}&segment=store-review`;
								window.open(url);
							}}
						>
							<div className="review-wrapper">
								{review && review.length > 0 ? (
									review.map((reviewItem) => (
										<div
											className="review"
											key={reviewItem.review_id}
										>
											<div className="details">
												<div className="title">
													<div className="avatar">
														<i className="adminfont-person" />
													</div>
													{reviewItem.review_title}
												</div>
												<div className="star-wrapper">
													{[...Array(5)].map(
														(_, index) => (
															<i
																key={index}
																className={`star-icon adminfont-star ${index < Math.round(reviewItem.overall_rating) ? 'active' : ''}`}
															/>
														)
													)}
													<span>
														{formatDate(
															reviewItem.date_created
														)}
													</span>
												</div>
												<div className="des">
													{truncateText(
														reviewItem.review_content,
														5
													)}
												</div>
											</div>
										</div>
									))
								) : (
									<ComponentStatusView title={__('No reviews found.', 'multivendorx')} />
								)}
							</div>
						</Card>
					</Column>
				)}
			</Container>
		</>
	);
};

export default Dashboard;
