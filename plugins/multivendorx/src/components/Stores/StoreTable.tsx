/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, TableCard } from 'zyra';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatLocalDate } from '../../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

const StoreTable: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [storeSlugMap, setStoreSlugMap] = useState<Record<number, string>>({});
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);

	const navigate = useNavigate();

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					filter_status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
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
					.filter((item: any) => item?.id != null)
					.map((item: any) => item.id);

				setRowIds(ids);

				setRows(items);

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

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const headers = {
		store_name: {
			label: 'Store',
		},
		email: {
			label: 'Contact',
		},
		lifetime_earning: {
			label: 'Lifetime Earning',
			render: (row) => (
				formatCurrency(row.commission?.commission_total)
			),
		},
		primary_owner: {
			label: 'Primary Owner',
			render: (row) => (
				row.primary_owner?.data?.display_name
			),
		},
		status: {
			label: 'Status',
			type:'status'
		},
		action: {
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Settings', 'multivendorx'),
					icon: 'setting',
					onClick: (row) => {
						navigate(`?page=multivendorx#&tab=stores&edit/${row.id}`);
					},
				},
				{
					label: __('Storefront', 'multivendorx'),
					icon: 'storefront',
					onClick: (row) => {
						window.open(
							`${appLocalizer.store_page_url}${row.slug}`,
							'_blank'
						);
					},
				},
			],
		},
	};
	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		}
	];
	return (
		<div className="general-wrapper">
			<div className="admin-table-wrapper">
				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={doRefreshTableData}
					ids={rowIds}
					categoryCounts={categoryCounts}
					search={{}}
					filters={filters}
					format={appLocalizer.date_format}
					currencySymbol={appLocalizer.currency_symbol}
				/>
			</div>
		</div>
	);
};

export default StoreTable;
