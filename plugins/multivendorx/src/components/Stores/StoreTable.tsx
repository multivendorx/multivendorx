/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent } from '@zyra/components';
import { TableCard, TableRow, QueryProps, CategoryCount } from '@zyra/table';
import {
	formatDate,
	formatLocalDate,
	formatStatusLabel,
	getUrl,
} from '../../services/commonFunction';
import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { SAMPLE_STORES, sampleCategoryCounts } from '../Popup/sampleRows';

interface StoreTableProps {
	/** Opens the "Add Store" popup (Stores' header button); the "No stores yet" card offers it too. */
	onAddStore?: () => void;
}

const StoreTable: React.FC<StoreTableProps> = ({ onAddStore }) => {
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
		lifetime_earning: {
			label: __('Lifetime Earning', 'multivendorx'),
			type: 'labeled',
			valueType: 'currency',
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
	/** A `/stores` record as a table row; the sample stores go through it too, so they look like real ones. */
	const toInfoRow = (row: any) => ({
		...row,
		lifetime_earning: row.commission?.commission_total,
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
		],
		info_badges: [
			{
				text: formatStatusLabel(row.status),
				color: `badge-${row.status}`,
			},
			{ text: formatDate(row.create_time), color: 'blue' },
		],
	});
	const infoRows = rows.map(toInfoRow);

	const { props: gatedProps, hasNoRecords } = useNoRecordsYet({
		rows: infoRows,
		isLoading,
		onQueryUpdate: doRefreshTableData,
	});

	const tableProps = {
		headers,
		variant: 'transparent',
		search: {},
		filters,
		format: appLocalizer.date_format,
		currency: {
			currencySymbol: appLocalizer.currency_symbol,
			priceDecimals: appLocalizer.price_decimals,
			decimalSeparator: appLocalizer.decimal_separator,
			thousandSeparator: appLocalizer.thousand_separator,
			currencyPosition: appLocalizer.currency_position,
		},
	};

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<ListGate
					feature={{
						title: __('Stores', 'multivendorx'),
						description: '',
						icon: 'storefront',
					}}
					sample={
						<TableCard
							{...tableProps}
							rows={SAMPLE_STORES.map(toInfoRow)}
							totalRows={SAMPLE_STORES.length}
							categoryCounts={sampleCategoryCounts(
								SAMPLE_STORES,
								{
									active: __('Active', 'multivendorx'),
									under_review: __(
										'Under Review',
										'multivendorx'
									),
								},
								__('All', 'multivendorx')
							)}
						/>
					}
					isEmpty={hasNoRecords}
					empty={{
						heading: __('No stores yet', 'multivendorx'),
						description: __(
							'Each seller gets a store. They show here once sellers sign up from your registration page, or when you add one yourself.',
							'multivendorx'
						),
						actions: (
							<>
								{onAddStore && (
									<button
										type="button"
										className="mvx-locked-button"
										onClick={onAddStore}
									>
										{__('Add a store', 'multivendorx')}
									</button>
								)}
								<a
									className="mvx-locked-link"
									href="#&tab=settings&subtab=registration"
								>
									{__('Set up registration', 'multivendorx')}
								</a>
							</>
						),
						note: __(
							'A preview with sample stores. Yours show here once the first one is added.',
							'multivendorx'
						),
					}}
				>
					<TableCard
						{...tableProps}
						rows={infoRows}
						totalRows={totalRows}
						isLoading={isLoading}
						onQueryUpdate={gatedProps.onQueryUpdate}
						ids={rowIds}
						categoryCounts={categoryCounts}
						bulkActions={bulkActions}
						onBulkActionApply={(
							action: string,
							selectedIds: []
						) => {
							handleBulkAction(action, selectedIds);
						}}
					/>
				</ListGate>
			</ColumnComponent>
		</ContainerComponent>
	);
};

export default StoreTable;
