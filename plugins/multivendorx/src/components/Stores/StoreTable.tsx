/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	TableCard,
	TableRow,
	QueryProps,
	CategoryCount,
	Container,
	Column,
} from 'zyra';
import { useNavigate } from 'react-router-dom';
import {
	formatCurrency,
	formatDate,
	formatLocalDate,
} from '../../services/commonFunction';

const StoreTable: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
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
					.filter((item: any) => item?.id != null)
					.map((item: any) => item.id);

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
							Number(response.headers['x-wp-status-under-review']) || 0,
					},
					{
						value: 'suspended',
						label: __('Suspended', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-suspended']) || 0,
					},
					{
						value: 'deactivated',
						label: __('Deactivated', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-deactivated']) || 0,
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
			label: __('Store', 'multivendorx'),
		},
		email: {
			label: __('Contact', 'multivendorx'),
		},
		lifetime_earning: {
			label: __('Lifetime Earning', 'multivendorx'),
			render: (row) => formatCurrency(row.commission?.commission_total),
		},
		primary_owner: {
			label: __('Primary Owner', 'multivendorx'),
			render: (row) => row.primary_owner?.data?.display_name,
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},
		action: {
			key: 'action',
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Settings', 'multivendorx'),
					icon: 'setting',
					onClick: (row) => {
						navigate(
							`?page=multivendorx#&tab=stores&edit/${row.id}`
						);
					},
				},
				{
					label: __('Storefront', 'multivendorx'),
					icon: 'storefront',
					onClick: (row) => {
						window.open(
							`${appLocalizer.store_page_url}${row.store_slug}`,
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
		},
	];
	return (
		<Container general>
			<Column>
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
			</Column>
		</Container>
	);
};

export default StoreTable;
