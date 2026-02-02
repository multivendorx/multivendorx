import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Analytics, Card, Column, getApiLink, TableCard } from 'zyra';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';
import { formatCurrency, formatDate, formatLocalDate } from '../../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

const StoreReport: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);
	const [overviewData, setOverviewData] = useState<any[]>([]);
	const [pieData, setPieData] = useState<{ name: string; value: number }[]>(
		[]
	);
	const Counter = ({ value, duration = 1200 }) => {
		const [count, setCount] = React.useState(0);

		React.useEffect(() => {
			let start = 0;
			const end = parseInt(value);
			if (start === end) {
				return;
			}

			const increment = end / (duration / 16);

			const timer = setInterval(() => {
				start += increment;
				if (start >= end) {
					start = end;
					clearInterval(timer);
				}
				setCount(Math.floor(start));
			}, 16);

			return () => clearInterval(timer);
		}, [value, duration]);

		return <>{count}</>;
	};

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					filterStatus: query.categoryFilter === 'all' ? '' : query.categoryFilter,
					searchValue: query.searchValue || '',
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					orderBy: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];

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

				const ids = items
					.filter((ann: any) => ann?.id != null)
					.map((ann: any) => ann.id);

				setRowIds(ids);

				const mappedRows: any[][] = items.map((store: any) => [
					{
						display: store.store_name,
						value: store.id,
						type: 'card',
						data: {
							name: store.store_name,
							image: store.image,
							description: `Since ${formatDate(store.applied_on)}`,
							link: `?page=multivendorx#&tab=stores&edit/${store.id}`,
							icon: 'adminfont-store-inventory'
						},
					},
					{
						display: store.primary_owner?.data?.display_name || '—',
						value: store.primary_owner?.ID || null,
						type: 'card',
						data: {
							name: store.primary_owner?.data?.display_name,
							image: store.primary_owner?.data?.primary_owner_image,
							icon: 'adminfont-person',
							description: store.primary_owner?.data?.user_email
						}
					},
					{
						display: store.status,
						value: store.status,
					},
					{
						display: formatCurrency(store.commission?.total_order_amount),
						value: store.commission?.total_order_amount ?? 0,
					},
					{
						display: formatCurrency(store.commission?.shipping_amount),
						value: store.commission?.shipping_amount ?? 0,
					},
					{
						display: formatCurrency(store.commission?.tax_amount),
						value: store.commission?.tax_amount ?? 0,
					},
					{
						display: formatCurrency(store.commission?.commission_total),
						value: store.commission?.commission_total ?? 0,
					},
					{
						display: store.email,
						value: store.email,
						type: 'card',
						data: {
							name: store.email,
							icon: 'adminfont-mail',
						}
					},
					{
						display: formatCurrency(
							Number(store.commission?.total_order_amount || 0) -
							Number(store.commission?.commission_total || 0)
						),
						value:
							Number(store.commission?.total_order_amount || 0) -
							Number(store.commission?.commission_total || 0),
					}
					
				]);

				setRows(mappedRows);

				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'active',
						label: 'Active',
						count: Number(response.headers['x-wp-status-active']) || 0,
					},
					{
						value: 'under_review',
						label: 'Under Review',
						count: Number(response.headers['x-wp-status-under-review']) || 0,
					},
					{
						value: 'suspended',
						label: 'Suspended',
						count: Number(response.headers['x-wp-status-suspended']) || 0,
					},
					{
						value: 'deactivated',
						label: 'Deactivated',
						count: Number(response.headers['x-wp-status-deactivated']) || 0,
					},
				]);

				setOverviewData([
					{
						id: 'all',
						label: 'All Stores',
						count: Number(response.headers['x-wp-total']) || 0,
						icon: 'storefront blue',
					},
					{
						id: 'active',
						label: 'Active Stores',
						count: Number(response.headers['x-wp-status-active']) || 0,
						icon: 'store-policy green',
					},
					{
						id: 'pending',
						label: 'Pending Stores',
						count: Number(response.headers['x-wp-status-pending']) || 0,
						icon: 'pending yellow',
					},
					{
						id: 'deactivated',
						label: 'Deactivated Stores',
						count: Number(response.headers['x-wp-status-deactivated']) || 0,
						icon: 'close-delete red',
					},
				]);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const headers = [
		{ key: 'store_name', label: 'Store', isSortable: true, },
		{ key: 'primary_owner', label: 'Primary Owner' },
		{ key: 'status', label: 'Status' },
		{ key: 'order_total', label: 'Order Total' },
		{ key: 'shipping', label: 'Shipping' },
		{ key: 'tax', label: 'Tax' },
		{ key: 'store_ommission', label: 'Store Commission' },
		{ key: 'contact', label: 'Contact' },
		{ key: 'admin_earning', label: 'Admin Earnings' },
	];
	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		}
	];

	return (
		<>
			<Column>
				<Analytics
					data={overviewData.map((item) => ({
						icon: item.icon,
						number: <Counter value={item.count} />,
						text: __(item.label, 'multivendorx'),
					}))}
				/>
			</Column>

			<Card title={__('Top revenue-generating stores', 'multivendorx')}>
				<ResponsiveContainer width="100%" height={300}>
					<PieChart>
						{pieData.length > 0 && (
							<Pie
								data={pieData}
								cx="50%"
								cy="50%"
								outerRadius={100}
								dataKey="value"
							/>
						)}
						<Tooltip formatter={(value) => formatCurrency(value)} />
						<Legend />
					</PieChart>
				</ResponsiveContainer>

			</Card>

			<div className="card-header admin-pt-2">
				<div className="left">
					<div className="title">
						{__('Account Overview', 'multivendorx')}
					</div>
				</div>
				<div className="right">
					<span>{__('Updated 1 month ago (p)', 'multivendorx')}</span>
				</div>
			</div>

			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{}}
				filters={filters}
			/>
		</>
	);
};

export default StoreReport;
