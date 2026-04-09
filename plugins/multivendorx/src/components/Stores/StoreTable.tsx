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
	InfoItem,
} from 'zyra';
import {
	formatCurrency,
	formatDate,
	formatLocalDate,
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
			render: (row) => (
				<InfoItem
					title={row.store_name}
					titleLink={getUrl(row.id, 'store', 'edit')}
					avatar={{
						image: row.store_image,
						iconClass: row.store_image ? '' : 'store-inventory',
					}}
					descriptions={[
						{
							label: __('Since', 'multivendorx'),
							value: formatDate(row.create_time) || '—',
						},
					]}
				/>
			),
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
			render: (row) => {
				const owner = row.primary_owner?.data;

				return (
					<InfoItem
						title={owner?.display_name}
						titleLink={getUrl(row.id, 'store', 'edit')}
						avatar={{
							imageHtml: row.primary_owner_image,
							iconClass: row.primary_owner_image ? 'person' : '',
						}}
						descriptions={[
							{
								label: __('Email', 'multivendorx'),
								value: owner?.user_email || '—',
							},
						]}
					/>
				);
			},
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
			url: getApiLink(appLocalizer, `store/${selectedIds[0]}`),
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
					bulkActions={bulkActions}
					onBulkActionApply={(action: string, selectedIds: []) => {
						handleBulkAction(action, selectedIds);
					}}
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
