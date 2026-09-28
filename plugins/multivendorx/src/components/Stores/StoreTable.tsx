/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent } from '@zyra/components';
import { TableCard, TableRow, QueryProps, CategoryCount } from '@zyra/table';
import {
	formatCurrency,
	formatDate,
	formatLocalDate,
	formatStatusLabel,
	getUrl,
} from '../../services/commonFunction';

const StoreTable: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);

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
		action: {
			key: 'action',
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Settings', 'multivendorx'),
					icon: 'setting',
					onClick: (row) => {
						window.location.href = getUrl(row.id, 'store', 'edit'); // replace href promita di
					},
				},
				{
					label: __('Storefront', 'multivendorx'),
					icon: 'storefront',
					onClick: (row) => {
						window.open(
							getUrl(row.id, 'store', 'view', row.store_slug),
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
	const handleBulkAction = (action: string, selectedIds: []) => {
		if (!selectedIds.length) {
			return;
		}

		if (!action) {
			return;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${selectedIds[0]}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { action, ids: selectedIds },
		}).then(() => {
			doRefreshTableData({});
		});
	};
	const bulkActions = [
		{ label: __('Active', 'multivendorx'), value: 'active' },
		{ label: __('Under Review', 'multivendorx'), value: 'under_review' },
		{ label: __('Rejected', 'multivendorx'), value: 'rejected' },
		{ label: __('Suspended', 'multivendorx'), value: 'suspended' },
	];
	const infoRows = rows.map((row: any) => ({
		...row,
		info_icon: 'store-inventory',
		info_link: getUrl(row.id, 'store', 'edit'),
		info_descriptions: [
			{
				label: __('Contact', 'multivendorx'),
				icon: 'mail',
				value: row.email || '—',
			},
			{
				label: __('Primary Owner', 'multivendorx'),
				icon: 'person',
				value: row.primary_owner?.display_name || '—',
			},
			{
				label: __('Lifetime Earning', 'multivendorx'),
				icon: 'wallet',
				value: formatCurrency(row.commission?.commission_total),
			},
		],
		info_badges: [
			{
				text: formatStatusLabel(row.status),
				color: `badge-${row.status}`,
			},
			{ text: formatDate(row.create_time), color: 'gray' },
		],
	}));

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<TableCard
					headers={headers}
					variant="transparent"
					rows={infoRows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={doRefreshTableData}
					ids={rowIds}
					categoryCounts={categoryCounts}
					bulkActions={bulkActions}
					onBulkActionApply={(action: string, selectedIds: []) => {
						handleBulkAction(action, selectedIds);
					}}
					search={{}}
					filters={filters}
					format={appLocalizer.date_format}
					currencySymbol={appLocalizer.currency_symbol}
				/>
			</ColumnComponent>
		</ContainerComponent>
	);
};

export default StoreTable;
