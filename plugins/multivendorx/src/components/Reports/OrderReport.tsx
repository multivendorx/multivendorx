/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { QueryProps, TableCard, TableRow } from '@zyra/table';

import {
	downloadCSV,
	formatCurrency,
	formatDate,
	formatLocalDate,
	formatStatusLabel,
	getUrl,
	toWcIsoDate,
} from '../../services/commonFunction';

const OrderReport: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState([]);
	/**
	 * Fetch store list on mount
	 */
	useEffect(() => {
		// Fetch store list
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
		id: { label: __('Order', 'multivendorx') },
		store_name: { label: __('Store', 'multivendorx') },
		total: { label: __('Amount', 'multivendorx') },
		commission_total: { label: __('Commission', 'multivendorx') },
		date_created: { label: __('Date', 'multivendorx') },
		status: { label: __('Status', 'multivendorx') },
	};

	const infoRows = rows.map((row: any) => ({
		...row,
		order_title: `#${row.id}`,
		info_icon: 'order',
		info_link: getUrl(row.id, 'order'),
		info_descriptions: [
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
				label: __('Amount', 'multivendorx'),
				icon: 'dollar',
				value: formatCurrency(row.total),
			},
			{
				label: __('Commission', 'multivendorx'),
				icon: 'commission',
				value: formatCurrency(row.commission_total),
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
			label: __('Select Stores', 'multivendorx'),
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
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildOrderQueryParams(query, false),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					csvHeaders,
					rows,
					`order-${formatLocalDate(new Date())}.csv`
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
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildOrderQueryParams(query),
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

	const buildOrderQueryParams = (
		query: QueryProps,
		includePagination: boolean = true
	) => {
		const params = {
			search: query.searchValue || '',
			orderby: query.orderby || 'date',
			order: query.order || 'desc',
			meta_key: 'multivendorx_store_id',
			value: query.filter?.store_id || undefined,
			after: query.filter?.created_at?.startDate
				? toWcIsoDate(query.filter.created_at.startDate, 'start')
				: undefined,
			before: query.filter?.created_at?.endDate
				? toWcIsoDate(query.filter.created_at.endDate, 'end')
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
				search={{ placeholder: 'Search Products...' }}
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

export default OrderReport;
