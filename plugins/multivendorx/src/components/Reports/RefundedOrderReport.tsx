/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, InfoItem, QueryProps, TableCard, TableRow } from 'zyra';
import axios from 'axios';
import {
	downloadCSV,
	formatLocalDate,
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
			.get(getApiLink(appLocalizer, 'store'), {
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
		order_id: {
			label: __('Order', 'multivendorx'),
			isSortable: true,
			render: (row) => (
				<a
					href={getUrl(row.order_id, 'order')}
					target="_blank"
					rel="noopener noreferrer"
					className="link-item"
				>
					#{row.order_id}
				</a>
			),
		},
		customer_name: {
			label: __('Customer', 'multivendorx'),
		},
		store_name: {
			label: __('Store', 'multivendorx'),
			render: (row) => (
				<InfoItem
					title={row.store_name}
					titleLink={getUrl(row.store_id, 'store', 'edit')}
					avatar={{
						iconClass: 'store-inventory',
					}}
				/>
			),
		},
		amount: {
			label: __('Refund Amount', 'multivendorx'),
			type: 'currency',
		},
		customer_reason: {
			label: __('Refund Reason', 'multivendorx'),
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},
		date_created: {
			label: __('Date', 'multivendorx'),
			type: 'date',
			isSortable: true,
		},
	};

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
			.get(getApiLink(appLocalizer, 'refund'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildRefundQueryParams(query),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					headers,
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
			.get(getApiLink(appLocalizer, 'refund'), {
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
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				search={{
					placeholder: 'Search Products...',
					options: [
						{ label: __('Order ID', 'multivendorx'), value: 'order_id' },
						{ label: __('Customer', 'multivendorx'), value: 'customer' },
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
