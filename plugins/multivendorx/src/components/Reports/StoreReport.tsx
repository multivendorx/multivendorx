/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { AnalyticsComponent, CardComponent, ColumnComponent } from '@zyra/components';
import { TableCard, TableRow, QueryProps, CategoryCount } from '@zyra/table';
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
	formatStatusLabel,
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
					getApiLink(appLocalizer, 'stores'),
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
			.get(getApiLink(appLocalizer, 'stores'), {
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
			type: 'info',
			iconKey: 'info_icon',
			titleLinkKey: 'info_link',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
	};

	const infoRows = rows.map((row: any) => ({
		...row,
		info_icon: 'store-inventory',
		info_link: getUrl(row.id, 'store'),
		info_descriptions: [
			{
				label: __('Primary Owner', 'multivendorx'),
				icon: 'person',
				value: row.primary_owner?.display_name || '—',
			},
			{
				label: __('Contact', 'multivendorx'),
				icon: 'mail',
				value: row.email || '—',
			},
			{
				label: __('Order Total', 'multivendorx'),
				icon: 'cart',
				value: formatCurrency(row.commission?.total_order_amount),
			},
			{
				label: __('Shipping', 'multivendorx'),
				icon: 'shipping',
				value: formatCurrency(row.commission?.shipping_amount),
			},
			{
				label: __('Tax', 'multivendorx'),
				icon: 'tax-compliance',
				value: formatCurrency(row.commission?.tax_amount),
			},
			{
				label: __('Store Commission', 'multivendorx'),
				icon: 'commission',
				value: formatCurrency(row.commission?.commission_total),
			},
			{
				label: __('Admin Earnings', 'multivendorx'),
				icon: 'wallet',
				value: formatCurrency(
					Number(row.commission?.total_order_amount || 0) -
						Number(row.commission?.commission_total || 0)
				),
			},
		],
		info_badges: [
			{
				text: formatStatusLabel(row.status),
				color: `badge-${row.status}`,
			},
			...(row.date ? [{ text: row.date, color: 'gray' }] : []),
		],
	}));

	const filters = [
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	return (
		<>
			<ColumnComponent row>
				<AnalyticsComponent
					cols={2}
					data={overviewData.map((item) => ({
						icon: item.icon,
						number: <Counter value={item.count} />,
						text: __(item.label, 'multivendorx'),
					}))}
					isLoading={isLoading}
				/>
				<CardComponent
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
				</CardComponent>
			</ColumnComponent>

			<TableCard
				headers={headers}
				variant="transparent"
				title={__('Account Overview', 'multivendorx')}
				rows={infoRows}
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
