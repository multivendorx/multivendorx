/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import axios from 'axios';
import {
	downloadCSV,
	formatCurrency,
	formatDate,
	formatLocalDate,
	formatStatusLabel,
	getUrl,
} from '../../services/commonFunction';

const RefundedOrderReport: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState([]);

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'stores'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { options: true },
			})
			.then((response) => {
				const options = (response.data || []).map((store) => ({
					label: store.store_name,
					value: store.id,
				}));

				setStore(options);
				setIsLoading(false);
			})
			.catch(() => {
				setStore([]);
				setIsLoading(false);
			});
	}, []);

	const headers = {
		order_title: {
			label: __('Order', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			titleLinkKey: 'info_link',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
	};

	// The table folds these fields into one info column, so the CSV
	// export lists its columns explicitly instead of reusing `headers`.
	const csvHeaders = {
		order_id: { label: __('Order', 'multivendorx') },
		customer_name: { label: __('Customer', 'multivendorx') },
		store_name: { label: __('Store', 'multivendorx') },
		amount: { label: __('Refund Amount', 'multivendorx') },
		customer_reason: { label: __('Refund Reason', 'multivendorx') },
		status: { label: __('Status', 'multivendorx') },
		date_created: { label: __('Date', 'multivendorx') },
	};

	const infoRows = rows.map((row: any) => ({
		...row,
		order_title: `#${row.order_id}`,
		info_icon: 'marketplace-refund',
		info_link: getUrl(row.order_id, 'order'),
		info_descriptions: [
			{
				label: __('Customer', 'multivendorx'),
				icon: 'person',
				value: row.customer_name || '—',
			},
			{
				label: __('Store', 'multivendorx'),
				icon: 'storefront',
				value: (
					<a
						href={getUrl(row.store_id, 'store', 'edit')}
						className="link-item"
					>
						{row.store_name || '—'}
					</a>
				),
			},
			{
				label: __('Refund Amount', 'multivendorx'),
				icon: 'dollar',
				value: formatCurrency(row.amount),
			},
			{
				label: __('Refund Reason', 'multivendorx'),
				icon: 'question',
				value: row.customer_reason || '—',
			},
		],
		info_badges: [
			{
				text: formatStatusLabel(row.status),
				color: `badge-${row.status}`,
			},
			{ text: formatDate(row.date_created), color: 'gray' },
		],
	}));

	const filters = [
		{
			key: 'store_id',
			label: __('Stores', 'multivendorx'),
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	const downloadCSVByQuery = (query: QueryProps) => {
		axios
			.get(getApiLink(appLocalizer, 'refunds'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildRefundQueryParams(query),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					csvHeaders,
					rows,
					`refund-report-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};

	const buttonActions = [
		{
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',
			onClickWithQuery: downloadCSVByQuery,
		},
	];

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'refunds'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildRefundQueryParams(query),
			})
			.then((response) => {
				const orders = Array.isArray(response.data)
					? response.data
					: [];

				setRowIds(orders.map((order) => order.id));

				setRows(orders);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Order fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const buildRefundQueryParams = (
		query: QueryProps,
		includePagination: boolean = true
	) => {
		const params = {
			search_action: query.searchAction || 'order_id',
			search_value: query.searchValue,
			order_by: query.orderby || 'date',
			order: query.order || 'desc',
			store_id: query.filter?.store_id,
			start_date: query.filter?.created_at?.startDate
				? formatLocalDate(query.filter.created_at.startDate)
				: undefined,
			end_date: query.filter?.created_at?.endDate
				? formatLocalDate(query.filter.created_at.endDate)
				: undefined,
		};

		if (includePagination) {
			params.page = query.page || 1;
			params.per_page = query.per_page || 10;
		}

		return params;
	};
	return (
		<>
			<TableCard
				headers={headers}
				variant="transparent"
				rows={infoRows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				search={{
					placeholder: 'Search Products...',
					size: 8,
					options: [
						{
							label: __('Order ID', 'multivendorx'),
							value: 'order_id',
						},
						{
							label: __('Customer', 'multivendorx'),
							value: 'customer',
						},
					],
				}}
				filters={filters}
				buttonActions={buttonActions}
				rowIds={rowIds}
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

export default RefundedOrderReport;
