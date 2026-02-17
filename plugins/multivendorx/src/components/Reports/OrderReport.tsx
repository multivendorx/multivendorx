import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { ExportCSV, getApiLink, TableCard } from 'zyra';

import { formatCurrency, formatWordpressDate, toWcIsoDate } from '../../services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

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
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const options =
					(response.data || []).map((store: any) => ({
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

	const headers = [
		{
			key: 'order_id',
			label: __('Order', 'multivendorx'),
		},
		{
			key: 'store',
			label: __('Store', 'multivendorx'),
		},
		{
			key: 'amount',
			label: __('Amount', 'multivendorx'),
		},
		{
			key: 'commission_amount',
			label: __('Commission', 'multivendorx'),
		},
		{
			key: 'date',
			label: __('Date', 'multivendorx'),
			isSortable: true,
		},
		{
			key: 'status',
			label: __('Status', 'multivendorx'),
		},
	];
	const filters = [
		{
			key: 'store_id',
			label: 'Stores',
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];
	const buttonActions = [
		{
		  label: __('Download CSV', 'multivendorx'),
		  icon: 'download',
		  onClickWithQuery: (query: QueryProps) => ExportCSV({
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			filename:
					query.filter?.created_at?.startDate &&
					query.filter?.created_at?.endDate
						? `orders-${(query.filter.created_at.startDate)}-${(query.filter.created_at.endDate)}.csv`
						: `orders-${(new Date())}.csv`,
			paramsBuilder: ({
			  per_page: 100,
			  page: 1,
			  search: query.searchValue,
			  orderby: query.orderby || 'date',
			  order: query.order || 'desc',
			}),
			columns: (item) => ({
			  [__('Order ID', 'multivendorx')]: item.id,
			  [__('Store', 'multivendorx')]: item.store_name || '',
			  [__('Amount', 'multivendorx')]: item.total,
			  [__('Commission', 'multivendorx')]: item.commission_total || 0,
			  [__('Status', 'multivendorx')]: item.status,
			  [__('Date', 'multivendorx')]: item.date_created,
			}),
		  }),
		},
	  ];
	  
	
	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
	
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.page,
					per_page: query.per_page,
					search: query.searchValue,
					orderby: query.orderby || 'date',
					order: query.order || 'desc',
					meta_key: 'multivendorx_store_id',
					value: query.filter?.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(query.filter.created_at.startDate, 'start')
						: undefined,
					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
				},
			})
			.then((response) => {
				const orders = Array.isArray(response.data)
					? response.data
					: [];
				setRowIds(orders.map((o: any) => o.id));
	
				const mappedRows: TableRow[][] = orders.map((order: any) => [
					{
						display: `#${order.id}`,
						value: order.id,
						type: 'card',
						data: {
							link: `${appLocalizer.site_url}/wp-admin/post.php?post=${order.id}&action=edit`,
							name:`#${order.id}`
						},
					},
					{
						display: order.store_name || '-',
						value: order.store_name || '',
					},
					{
						display: formatCurrency(order.currency_symbol, order.total),
						value: order.total,
					},
					{
						display: formatCurrency(order.currency_symbol, order.commission_total || 0),
						value: order.commission_total || 0,
					},
					{
						display: (formatWordpressDate(order.date_created)),
						value: order.date_created,
					},
					{
						display: order.status,
						value: order.status,
						type: 'status',
					},
				]);
	
				setRows(mappedRows);
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
	

	return (
		<>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
				search={{ placeholder: 'Search Products...' }}
				filters={filters}
				buttonActions={buttonActions}
				rowIds={rowIds}
				format={appLocalizer.date_format}
			/>
		</>
	);
};

export default OrderReport;
