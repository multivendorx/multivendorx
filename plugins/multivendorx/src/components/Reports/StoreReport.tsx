/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	Analytics,
	Card,
	Column,
	getApiLink,
	TableCard,
	TableRow,
	QueryProps,
	CategoryCount,
	InfoItem,
} from 'zyra';
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';
import axios from 'axios';
import {
	formatCurrency,
	formatLocalDate,
	getUrl,
} from '../../services/commonFunction';
import Counter from '@/services/Counter';
type OverViewItem = {
	id: string;
	label: string;
	count: number;
	icon: string;
};
const StoreReport: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [overviewData, setOverviewData] = useState<OverViewItem[]>([]);
	const [pieData, setPieData] = useState<{ name: string; value: number }[]>(
		[]
	);
	useEffect(() => {
		const fetchOverviewAndPie = async () => {
			try {
				const response = await axios.get(
					getApiLink(appLocalizer, 'store'),
					{
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
						params: {
							page: 1,
							row: 1000,
						},
					}
				);

				const items = response.data || [];

				// 🔹 Pie data
				const pieChartData = items
					.filter(
						(store) =>
							store.commission &&
							store.commission.commission_total > 0
					)
					.map((store) => ({
						name: `${store.store_name} (${formatCurrency(
							store.commission.commission_total
						)})`,
						value: store.commission.commission_total,
					}));

				setPieData(pieChartData);
				setOverviewData([
					{
						id: 'all',
						label: __('All Stores', 'multivendorx'),
						count: Number(response.headers['x-wp-total']) || 0,
						icon: 'storefront blue',
					},
					{
						id: 'active',
						label: __('Active Stores', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-active']) || 0,
						icon: 'store-policy green',
					},
					{
						id: 'pending',
						label: __('Pending Stores', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-pending']) ||
							0,
						icon: 'pending yellow',
					},
					{
						id: 'deactivated',
						label: __('Deactivated Stores', 'multivendorx'),
						count:
							Number(
								response.headers['x-wp-status-deactivated']
							) || 0,
						icon: 'close-delete red',
					},
				]);
			} catch (e) {
				setPieData([]);
				setOverviewData([]);
				console.error(e);
			}
		};

		fetchOverviewAndPie();
	}, []);

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					filter_status:
						query.categoryFilter === 'all'
							? ''
							: query.categoryFilter,
					search_value: query.searchValue || '',
					start_date: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					end_date: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					order_by: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item) => item?.id != null)
					.map((item) => item.id);

				setRowIds(ids);

				setRows(items);

				setCategoryCounts([
					{
						value: 'all',
						label: __('All', 'multivendorx'),
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'active',
						label: __('Active', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-active']) || 0,
					},
					{
						value: 'under_review',
						label: __('Under Review', 'multivendorx'),
						count:
							Number(
								response.headers['x-wp-status-under-review']
							) || 0,
					},
					{
						value: 'suspended',
						label: __('Suspended', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-suspended']) ||
							0,
					},
					{
						value: 'deactivated',
						label: __('Deactivated', 'multivendorx'),
						count:
							Number(
								response.headers['x-wp-status-deactivated']
							) || 0,
					},
				]);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
				console.error(error);
			});
	};

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
			width: 15,
			render: (row: any) => (
				<InfoItem
					title={row.store_name}
					titleLink={getUrl(row.id, 'store')}
					avatar={{
						image: row.store_image,
						iconClass: row.store_image ? '' : 'store-inventory',
					}}
					descriptions={[
						{
							label: __('Since', 'multivendorx'),
							value: row.date || '—',
						},
					]}
				/>
			),
		},
		primary_owner: {
			key: 'primary_owner',
			label: __('Primary Owner', 'multivendorx'),
			width: 15,
			render: (row) => (
				<>
					<InfoItem
						title={row.primary_owner?.data?.display_name}
						titleLink={getUrl(row.primary_owner.data.ID, 'user')}
						avatar={{
							imageHtml: row.primary_owner_image,
							iconClass: 'person',
						}}
						descriptions={[
							{
								label: __('Email', 'multivendorx'),
								value:
									row.primary_owner?.data?.user_email || '—',
							},
						]}
					/>
				</>
			),
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},
		order_total: {
			key: 'order_total',
			label: __('Order Total', 'multivendorx'),
			render: (row) => formatCurrency(row.commission?.total_order_amount),
		},
		shipping: {
			key: 'shipping',
			label: __('Shipping', 'multivendorx'),
			render: (row) => formatCurrency(row.commission?.shipping_amount),
		},
		tax: {
			label: __('Tax', 'multivendorx'),
			render: (row) => formatCurrency(row.commission?.tax_amount),
		},
		store_ommission: {
			label: __('Store Commission', 'multivendorx'),
			render: (row) => formatCurrency(row.commission?.commission_total),
		},
		email: { label: __('Contact', 'multivendorx') },
		admin_earning: {
			label: __('Admin Earnings', 'multivendorx'),
			render: (row) =>
				formatCurrency(
					Number(row.commission?.total_order_amount || 0) -
						Number(row.commission?.commission_total || 0)
				),
		},
	};

	const filters = [
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	return (
		<>
			<Column row>
				<Analytics
					cols={2}
					data={overviewData.map((item) => ({
						icon: item.icon,
						number: <Counter value={item.count} />,
						text: __(item.label, 'multivendorx'),
					}))}
				/>
				<Card
					title={__('Top revenue generating stores', 'multivendorx')}
				>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							{pieData.length > 0 && (
								<Pie
									data={pieData}
									cx="50%"
									cy="50%"
									outerRadius={100}
									dataKey="value"
								>
									{pieData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											className={`admin-color${index + 2}`}
										/>
									))}
								</Pie>
							)}

							<Tooltip
								formatter={(value: number) =>
									formatCurrency(value)
								}
							/>
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</Card>
			</Column>

			<TableCard
				headers={headers}
				title={__('Account Overview', 'multivendorx')}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{}}
				filters={filters}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>
		</>
	);
};

export default StoreReport;
